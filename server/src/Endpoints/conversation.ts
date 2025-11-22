import { Router, type Request, type Response } from "express";
import type { IDatabase } from "pg-promise";
import { uploadImage } from "../middleware/uploadImage";
import { chatWithToolsAndMaybeCreateEvent } from "../services/chatWithTools";
import { generateTitleFromFirstMessage } from "../services/titleGenerator";

export function conversationsRouter(db: IDatabase<unknown>) {
  const r = Router();

  // Get all conversations for the authenticated user
  r.get("/", async (req: Request, res: Response) => {
    try {
      // For development: use a default email if not authenticated
      const userEmail = req.user?.email || "dev@example.com";
      console.log("GET /conversations - userEmail:", userEmail);

      const rows = await db.manyOrNone(
        `select id, user_email as "userEmail", title, created_at as "createdAt", updated_at as "updatedAt"
         from conversation
         where user_email = $1
         order by updated_at desc`,
        [userEmail]
      );

      console.log("GET /conversations - found rows:", rows.length);
      res.json(rows);
    } catch (e: any) {
      console.error("fetch conversations error:", e);
      console.error("Error details:", e.message, e.stack);
      res.status(500).json({ error: "fetch_failed", details: e.message });
    }
  });

  // Create a new conversation
  r.post("/", async (req: Request, res: Response) => {
    try {
      // For development: use a default email if not authenticated
      const userEmail = req.user?.email || "dev@example.com";
      console.log("POST /conversations - userEmail:", userEmail);

      const title = req.body?.title || "New chat";
      console.log("POST /conversations - creating with title:", title);

      const convo = await db.one(
        `insert into conversation(user_email, title)
         values ($1, $2)
         returning id, user_email as "userEmail", title, created_at as "createdAt", updated_at as "updatedAt"`,
        [userEmail, title]
      );

      console.log("POST /conversations - created conversation:", convo);
      res.status(201).json(convo);
    } catch (e: any) {
      console.error("create conversation error:", e);
      console.error("Error details:", e.message, e.stack);
      res.status(500).json({ error: "create_failed", details: e.message });
    }
  });

  // Update conversation title
  r.patch("/:id", async (req: Request, res: Response) => {
    try {
      // For development: use a default email if not authenticated
      const userEmail = req.user?.email || "dev@example.com";

      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid_id" });

      const title = req.body?.title;
      if (!title) return res.status(400).json({ error: "title_required" });

      const convo = await db.oneOrNone(
        `update conversation
         set title = $3, updated_at = now()
         where id = $1 and user_email = $2
         returning id, user_email as "userEmail", title, created_at as "createdAt", updated_at as "updatedAt"`,
        [id, userEmail, title]
      );

      if (!convo) return res.status(404).json({ error: "not_found" });

      res.json(convo);
    } catch (e: any) {
      console.error("update conversation error:", e);
      console.error("Error details:", e.message, e.stack);
      res.status(500).json({ error: "update_failed", details: e.message });
    }
  });

  // Delete a conversation
  r.delete("/:id", async (req: Request, res: Response) => {
    try {
      // For development: use a default email if not authenticated
      const userEmail = req.user?.email || "dev@example.com";

      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid_id" });

      const result = await db.result(
        `delete from conversation where id = $1 and user_email = $2`,
        [id, userEmail]
      );

      if (result.rowCount === 0) return res.status(404).json({ error: "not_found" });

      res.json({ success: true });
    } catch (e: any) {
      console.error("delete conversation error:", e);
      console.error("Error details:", e.message, e.stack);
      res.status(500).json({ error: "delete_failed", details: e.message });
    }
  });

  r.get("/:id/messages", async (req: Request, res: Response) => {
    const id = Number(req.params.id); // parse id from route
    if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });

    const rows = await db.manyOrNone(
      `select
         id,
         conversation_id as "conversationId",
         role,
         content,
         image_url as "imageUrl",
         created_at     as "createdAt"
       from message
       where conversation_id = $1
       order by created_at asc`,
      [id]
    );

    res.json(rows); 
  });


  r.post("/:id/messages", uploadImage.single("image"), async (req: Request, res: Response) => {
    const conversationId = Number(req.params.id);
    if (!Number.isFinite(conversationId)) return res.status(400).json({ error: "invalid id" });

    const content = (req.body?.content ?? "").toString().trim();
    const model = (req.body?.model ?? "gemma3-27b").toString();
    if (!content) return res.status(400).json({ error: "content_required" });

    const userEmail = req.user?.email || "dev@example.com";

    // Handle uploaded image
    let imageData: string | null = null;
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype;
      imageData = `data:${mimeType};base64,${base64}`;
    }

    // Fetch all prior messages to construct the chat history
    const prior: Array<{ role: string; content: string; image_url?: string }> = await db.manyOrNone(
      `select role, content, image_url as "imageUrl"
         from message
        where conversation_id = $1
        order by created_at asc`,
      [conversationId]
    );
    
    // Build messages array in the format expected by the AI API
    const messages = prior.map(msg => {
      if (msg.image_url) {
        return {
          role: msg.role,
          content: [
            { type: "text", text: msg.content },
            { type: "image_url", image_url: { url: msg.image_url } }
          ]
        };
      }
      return { role: msg.role, content: msg.content };
    });

    // Add current user message
    if (imageData) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: content },
          { type: "image_url", image_url: { url: imageData } }
        ]
      });
    } else {
      messages.push({ role: "user", content });
    }

    // Call AI service with tools
    let replyContent: string;
    let eventCreated: any | null;
    
    try {
      const result = await chatWithToolsAndMaybeCreateEvent({ db, model, messages, userEmail });
      replyContent = result.replyContent;
      eventCreated = result.eventCreated;
    } catch (err: any) {
      if (err?.type === "upstream_error") {
        return res
          .status(err.status)
          .type("application/json")
          .send(JSON.stringify({
            title: "Chat provider error",
            detail: err.body,
            statusCode: err.status,
          }));
      }
      console.error("chat service error:", err);
      return res.status(500).json({ error: "chat_failed" });
    }

    try {
      // Insert the user's message with optional image
      const userMsg = await db.one(
        `insert into message(conversation_id, role, content, image_url)
         values ($1, 'user', $2, $3)
         returning id,
                   conversation_id as "conversationId",
                   role,
                   content,
                   image_url as "imageUrl",
                   created_at      as "createdAt"`,
        [conversationId, content, imageData]
      );

      // Insert the assistant's message
      const aiMsg = await db.one(
        `insert into message(conversation_id, role, content)
         values ($1, 'assistant', $2)
         returning id,
                   conversation_id as "conversationId",
                   role,
                   content,
                   image_url as "imageUrl",
                   created_at      as "createdAt"`,
        [conversationId, replyContent]
      );

      // Fetch the conversation to know the current title
      const convo = await db.oneOrNone(
        `select id, title from conversation where id = $1`,
        [conversationId]
      );
      if (!convo) return res.status(404).json({ error: "conversation_not_found" });

      const isFirstUserMessage = !prior.some(m => m.role === "user");
      const isDefaultTitle = (convo.title ?? "").trim().toLowerCase() === "new chat";

      if (isFirstUserMessage && isDefaultTitle) {
        try {
          const newTitle = await generateTitleFromFirstMessage(content);
          await db.none(
            `update conversation
               set title = $2, updated_at = now()
             where id = $1 and title = 'New chat'`,
            [conversationId, newTitle]
          );
        } catch (tErr) {
          console.warn("title generation failed:", tErr);
          await db.none(`update conversation set updated_at = now() where id = $1`, [conversationId]);
        }
      } else {
        await db.none(`update conversation set updated_at = now() where id = $1`, [conversationId]);
      }

      // Return both persisted messages and event info if created
      return res.json({ 
        userMessage: userMsg, 
        assistantMessage: aiMsg,
        ...(eventCreated && { eventCreated })
      });
    } catch (e: any) {
      if (e && e.code === "23503") {
        return res.status(404).json({ error: "conversation_not_found" });
      }
      console.error("message insert failed:", e);
      return res.status(500).json({ error: "message_insert_failed" });
    }
  });

  return r; 
}

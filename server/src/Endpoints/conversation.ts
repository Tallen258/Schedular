import { Router, type Request, type Response } from "express";
import type { IDatabase } from "pg-promise";
import { uploadImage } from "../middleware/uploadImage";
import { chatWithToolsAndMaybeCreateEvent } from "../services/chatWithTools";
import { generateTitleFromFirstMessage } from "../services/titleGenerator";
import {
  insertUserMessage,
  insertAssistantMessage,
  fetchPriorMessages,
  buildMessagesArray,
  updateConversationTitle,
  touchConversation
} from "../services/conversationHelpers";

export function conversationsRouter(db: IDatabase<unknown>) {
  const r = Router();

  r.get("/", async (req: Request, res: Response) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) return res.status(401).json({ error: "unauthorized" });

      const rows = await db.manyOrNone(
        `select id, user_email as "userEmail", title, created_at as "createdAt", updated_at as "updatedAt"
         from conversation where user_email = $1 order by updated_at desc`,
        [userEmail]
      );

      res.json(rows);
    } catch (e: any) {
      console.error("fetch conversations error:", e);
      res.status(500).json({ error: "fetch_failed", details: e.message });
    }
  });

  r.post("/", async (req: Request, res: Response) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) return res.status(401).json({ error: "unauthorized" });

      const title = req.body?.title || "New chat";
      const convo = await db.one(
        `insert into conversation(user_email, title) values ($1, $2)
         returning id, user_email as "userEmail", title, created_at as "createdAt", updated_at as "updatedAt"`,
        [userEmail, title]
      );

      res.status(201).json(convo);
    } catch (e: any) {
      console.error("create conversation error:", e);
      res.status(500).json({ error: "create_failed", details: e.message });
    }
  });

  r.patch("/:id", async (req: Request, res: Response) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) return res.status(401).json({ error: "unauthorized" });

      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid_id" });

      const title = req.body?.title;
      if (!title) return res.status(400).json({ error: "title_required" });

      const convo = await db.oneOrNone(
        `update conversation set title = $3, updated_at = now()
         where id = $1 and user_email = $2
         returning id, user_email as "userEmail", title, created_at as "createdAt", updated_at as "updatedAt"`,
        [id, userEmail, title]
      );

      if (!convo) return res.status(404).json({ error: "not_found" });
      res.json(convo);
    } catch (e: any) {
      console.error("update conversation error:", e);
      res.status(500).json({ error: "update_failed", details: e.message });
    }
  });

  r.delete("/:id", async (req: Request, res: Response) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) return res.status(401).json({ error: "unauthorized" });

      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid_id" });

      const result = await db.result(`delete from conversation where id = $1 and user_email = $2`, [id, userEmail]);
      if (result.rowCount === 0) return res.status(404).json({ error: "not_found" });

      res.json({ success: true });
    } catch (e: any) {
      console.error("delete conversation error:", e);
      res.status(500).json({ error: "delete_failed", details: e.message });
    }
  });

  r.get("/:id/messages", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });

    const rows = await db.manyOrNone(
      `select id, conversation_id as "conversationId", role, content,
              image_url as "imageUrl", created_at as "createdAt"
       from message where conversation_id = $1 order by created_at asc`,
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

    const userEmail = req.user?.email;
    if (!userEmail) return res.status(401).json({ error: "unauthorized" });

    let imageData: string | null = null;
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      imageData = `data:${req.file.mimetype};base64,${base64}`;
    }

    const prior = await fetchPriorMessages(db, conversationId);
    const messages = buildMessagesArray(prior, content, imageData);

    let replyContent: string;
    let eventCreated: any | null;
    
    try {
      const result = await chatWithToolsAndMaybeCreateEvent({ db, model, messages, userEmail });
      replyContent = result.replyContent;
      eventCreated = result.eventCreated;
    } catch (err: any) {
      if (err?.type === "upstream_error") {
        return res.status(err.status).type("application/json").send(JSON.stringify({
          title: "Chat provider error",
          detail: err.body,
          statusCode: err.status,
        }));
      }
      console.error("chat service error:", err);
      return res.status(500).json({ error: "chat_failed" });
    }

    try {
      const userMsg = await insertUserMessage(db, conversationId, content, imageData);
      const aiMsg = await insertAssistantMessage(db, conversationId, replyContent);

      const convo = await db.oneOrNone(`select id, title from conversation where id = $1`, [conversationId]);
      if (!convo) return res.status(404).json({ error: "conversation_not_found" });

      const isFirstUserMessage = !prior.some(m => m.role === "user");
      const isDefaultTitle = (convo.title ?? "").trim().toLowerCase() === "new chat";

      if (isFirstUserMessage && isDefaultTitle) {
        try {
          const newTitle = await generateTitleFromFirstMessage(content);
          await updateConversationTitle(db, conversationId, newTitle);
        } catch (tErr) {
          console.warn("title generation failed:", tErr);
          await touchConversation(db, conversationId);
        }
      } else {
        await touchConversation(db, conversationId);
      }

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

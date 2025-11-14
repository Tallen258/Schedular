import { Router, type Request, type Response } from "express";
import type { IDatabase } from "pg-promise";

/**
 * Generate a title from the first user message using AI
 */
async function generateTitleFromFirstMessage(firstMessage: string): Promise<string> {
  const prompt = `
Given ONLY the user’s first message,
output a short, descriptive sidebar title.

Requirements:
- Max 30 characters (soft cap), 3–5 words
- Use title case (capitalize main words)
- Return ONLY the title text

First message:
${firstMessage}
  `.trim();

  const base = process.env.AI_BASE_URL ?? "https://ai-snow.reindeer-pinecone.ts.net";
  const url = `${base}/api/chat/completions`; 
  const apiKey = process.env.OPENWEBUI_API_KEY; 

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey && apiKey.trim()) headers.Authorization = `Bearer ${apiKey}`;

  const payload = {
    model: "gemma3-27b",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  };

  const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
  const text = await resp.text();


  const json = JSON.parse(text);
  let title: string = json?.choices?.[0]?.message?.content ?? "New chat";

  // Sanitize & soft length cap for sidebar
  title = title.replace(/\r?\n/g, " ").trim();
  if (title.length > 28) title = title.slice(0, 27) + "…";
  if (!title) title = "New chat";
  return title;
}

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
         created_at     as "createdAt"
       from message
       where conversation_id = $1
       order by created_at asc`,
      [id]
    );

    res.json(rows); 
  });


  r.post("/:id/messages", async (req: Request, res: Response) => {
    const conversationId = Number(req.params.id); // parse conversation id
    if (!Number.isFinite(conversationId)) return res.status(400).json({ error: "invalid id" });

    const content = (req.body?.content ?? "").toString().trim(); // user message content
    const model = (req.body?.model ?? "gemma3-27b").toString(); // model name (optional override)
    if (!content) return res.status(400).json({ error: "content_required" });

    // Fetch all prior messages to construct the chat history sent upstream
    const prior: Array<{ role: string; content: string }> = await db.manyOrNone(
      `select role, content
         from message
        where conversation_id = $1
        order by created_at asc`,
      [conversationId]
    );
    const messages = [...prior, { role: "user", content }]; 

    // Prepare upstream AI request
    const base = process.env.AI_BASE_URL ?? "https://ai-snow.reindeer-pinecone.ts.net";
    const url = `${base}/api/chat/completions`;
    const apiKey = process.env.OPENWEBUI_API_KEY;
    const headers = {
      "Content-Type": "application/json",
      ...(apiKey && apiKey.trim() ? { Authorization: `Bearer ${apiKey}` } : {}),
    };

    // Send chat history to AI
    const upstream = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ model, messages, temperature: 0.2 }),
    });

    // Read body text regardless of status for better diagnostics
    const bodyText = await upstream.text();
    if (!upstream.ok) {
      // Bubble up upstream error with its body for debugging
      return res.status(upstream.status).type("application/json").send(JSON.stringify({
        title: "Chat provider error",
        detail: bodyText,
        statusCode: upstream.status,
      }));
    }

    // Parse AI JSON and pull the assistant content
    const json = JSON.parse(bodyText);
    const replyContent: string = json?.choices?.[0]?.message?.content ?? "";

    try {
      // Insert the user's message
      const userMsg = await db.one(
        `insert into message(conversation_id, role, content)
         values ($1, 'user', $2)
         returning id,
                   conversation_id as "conversationId",
                   role,
                   content,
                   created_at      as "createdAt"`,
        [conversationId, content]
      );

      // Insert the assistant's message
      const aiMsg = await db.one(
        `insert into message(conversation_id, role, content)
         values ($1, 'assistant', $2)
         returning id,
                   conversation_id as "conversationId",
                   role,
                   content,
                   created_at      as "createdAt"`,
        [conversationId, replyContent]
      );

      // Fetch the conversation to know the current title (to avoid unnecessary title-gen)
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
        // Not first message or already renamed → just bump updated_at
        await db.none(`update conversation set updated_at = now() where id = $1`, [conversationId]);
      }

      // Return both persisted messages
      return res.json({ userMessage: userMsg, assistantMessage: aiMsg });
    } catch (e: any) {
      // Foreign key violation → conversation not found
      if (e && e.code === "23503") {
        return res.status(404).json({ error: "conversation_not_found" });
      }
      console.error("message insert failed:", e);
      return res.status(500).json({ error: "message_insert_failed" });
    }
  });

  return r; // export the configured router
}

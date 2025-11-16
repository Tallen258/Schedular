import { Router, type Request, type Response } from "express";
import type { IDatabase } from "pg-promise";
import multer from "multer";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

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
         image_url as "imageUrl",
         created_at     as "createdAt"
       from message
       where conversation_id = $1
       order by created_at asc`,
      [id]
    );

    res.json(rows); 
  });


  r.post("/:id/messages", upload.single("image"), async (req: Request, res: Response) => {
    const conversationId = Number(req.params.id); // parse conversation id
    if (!Number.isFinite(conversationId)) return res.status(400).json({ error: "invalid id" });

    const content = (req.body?.content ?? "").toString().trim(); // user message content
    const model = (req.body?.model ?? "gemma3-27b").toString(); // model name (optional override)
    if (!content) return res.status(400).json({ error: "content_required" });

    // Get user email for event creation
    const userEmail = req.user?.email || "dev@example.com";

    // Handle uploaded image
    let imageData: string | null = null;
    let imageBase64: string | null = null;
    
    if (req.file) {
      // Convert image buffer to base64
      const base64 = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype;
      imageData = `data:${mimeType};base64,${base64}`;
      imageBase64 = base64;
    }

    // Fetch all prior messages to construct the chat history sent upstream
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
        // Message with image - use content array format
        return {
          role: msg.role,
          content: [
            { type: "text", text: msg.content },
            { type: "image_url", image_url: { url: msg.image_url } }
          ]
        };
      }
      // Text-only message
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

    // Define tools for event creation
    const tools = [
      {
        type: "function",
        function: {
          name: "create_event",
          description: "Create a new calendar event for the user. Use this when the user asks to schedule, create, or add an event to their calendar.",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "The title/name of the event"
              },
              description: {
                type: "string",
                description: "Optional detailed description of the event"
              },
              location: {
                type: "string",
                description: "Optional location where the event will take place"
              },
              start_time: {
                type: "string",
                description: "Start date and time in ISO 8601 format (e.g., 2024-11-15T14:00:00Z or 2024-11-15T14:00:00-05:00)"
              },
              end_time: {
                type: "string",
                description: "End date and time in ISO 8601 format (e.g., 2024-11-15T15:00:00Z or 2024-11-15T15:00:00-05:00)"
              },
              all_day: {
                type: "boolean",
                description: "Whether this is an all-day event. Default is false."
              }
            },
            required: ["title", "start_time", "end_time"]
          }
        }
      }
    ];

    // Prepare upstream AI request
    const base = process.env.AI_BASE_URL ?? "https://ai-snow.reindeer-pinecone.ts.net";
    const url = `${base}/api/chat/completions`;
    const apiKey = process.env.OPENWEBUI_API_KEY;
    const headers = {
      "Content-Type": "application/json",
      ...(apiKey && apiKey.trim() ? { Authorization: `Bearer ${apiKey}` } : {}),
    };

    // Send chat history to AI with tools
    const upstream = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ model, messages, tools, temperature: 0.2 }),
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
    const assistantMessage = json?.choices?.[0]?.message;
    let replyContent: string = assistantMessage?.content ?? "";
    
    // Check if AI wants to call a tool
    const toolCalls = assistantMessage?.tool_calls;
    let eventCreated = null;
    
    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      
      if (toolCall.function.name === "create_event") {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          
          // Create the event in the database
          const event = await db.one(`
            insert into events (user_email, title, description, location, start_time, end_time, all_day)
            values ($1, $2, $3, $4, $5, $6, $7)
            returning id, user_email, title, description, location, start_time, end_time, all_day, created_at, updated_at
          `, [
            userEmail,
            args.title,
            args.description || null,
            args.location || null,
            args.start_time,
            args.end_time,
            args.all_day || false
          ]);
          
          eventCreated = event;
          
          // Make a follow-up call to the AI with the tool result
          const followUpMessages = [
            ...messages,
            assistantMessage,
            {
              role: "tool",
              tool_call_id: toolCall.id,
              name: "create_event",
              content: JSON.stringify({ success: true, event })
            }
          ];
          
          const followUpResponse = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({ model, messages: followUpMessages, tools, temperature: 0.2 }),
          });
          
          const followUpText = await followUpResponse.text();
          if (followUpResponse.ok) {
            const followUpJson = JSON.parse(followUpText);
            replyContent = followUpJson?.choices?.[0]?.message?.content ?? "Event created successfully!";
          } else {
            replyContent = "Event created successfully!";
          }
        } catch (toolError: any) {
          console.error("Tool execution error:", toolError);
          replyContent = `I tried to create the event but encountered an error: ${toolError.message}`;
        }
      }
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

      // Return both persisted messages and event info if created
      return res.json({ 
        userMessage: userMsg, 
        assistantMessage: aiMsg,
        ...(eventCreated && { eventCreated })
      });
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

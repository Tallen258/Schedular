import type { IDatabase } from "pg-promise";

export interface ChatResult {
  replyContent: string;
  eventCreated: any | null;
}

export async function chatWithToolsAndMaybeCreateEvent(options: {
  db: IDatabase<unknown>;
  model: string;
  messages: any[];
  userEmail: string;
}): Promise<ChatResult> {
  const { db, model, messages, userEmail } = options;

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
              description: "Start date and time in ISO 8601 format with Mountain Standard Time offset. ALWAYS use -07:00 timezone offset (e.g., 2024-11-15T14:00:00-07:00). The user is in MST timezone."
            },
            end_time: {
              type: "string",
              description: "End date and time in ISO 8601 format with Mountain Standard Time offset. ALWAYS use -07:00 timezone offset (e.g., 2024-11-15T15:00:00-07:00). The user is in MST timezone."
            },
            all_day: {
              type: "boolean",
              description: "Whether this is an all-day event. Default is false."
            }
          },
          required: ["title", "start_time", "end_time"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "get_today_schedule",
        description: "Get the user's schedule for today. Use this when the user asks about their schedule, what they have today, or their agenda for today.",
        parameters: {
          type: "object",
          properties: {}
        }
      }
    }
  ];

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
    throw {
      type: "upstream_error",
      status: upstream.status,
      body: bodyText,
    };
  }

  const json = JSON.parse(bodyText);
  const assistantMessage = json?.choices?.[0]?.message;
  let replyContent: string = assistantMessage?.content ?? "";
  
  const toolCalls = assistantMessage?.tool_calls;
  let eventCreated = null;
  
  if (toolCalls && toolCalls.length > 0) {
    const toolCall = toolCalls[0];
    
    if (toolCall.function.name === "get_today_schedule") {
      try {
        // Get today's date
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayDate = `${year}-${month}-${day}`;
        
        // Fetch today's events - convert both to date for comparison to handle any timezone differences
        const events = await db.any(`
          select id, title, description, location, start_time, end_time, all_day
          from events
          where user_email = $1
            and date(start_time at time zone 'America/Denver') = date($2)
          order by start_time asc
        `, [userEmail, todayDate]);
        
        const followUpMessages = [
          ...messages,
          assistantMessage,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            name: "get_today_schedule",
            content: JSON.stringify({ success: true, events, count: events.length })
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
          replyContent = followUpJson?.choices?.[0]?.message?.content ?? "Here's your schedule for today.";
        } else {
          replyContent = "Here's your schedule for today.";
        }
      } catch (toolError: any) {
        console.error("Tool execution error:", toolError);
        replyContent = `I tried to fetch your schedule but encountered an error: ${toolError.message}`;
      }
    } else if (toolCall.function.name === "create_event") {
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

  return { replyContent, eventCreated };
}

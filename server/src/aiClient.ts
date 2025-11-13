// src/aiClient.ts
import fetch from "node-fetch"; // ⭐ add this line

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const AI_BASE_URL =
  process.env.AI_BASE_URL ?? "https://ai-snow.reindeer-pinecone.ts.net";
const AI_API_KEY = process.env.OPENWEBUI_API_KEY ?? "";

export async function callChatCompletion(options: {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
}): Promise<string> {
  const {
    messages,
    model = "gpt-oss-120b",
    temperature = 0.2,
  } = options;

  const url = `${AI_BASE_URL}/api/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (AI_API_KEY.trim()) {
    headers.Authorization = `Bearer ${AI_API_KEY}`;
  }

  const payload = { model, messages, temperature };

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const bodyText = await resp.text();

  if (!resp.ok) {
    throw new Error(`AI error ${resp.status}: ${bodyText || resp.statusText}`);
  }

  const json = JSON.parse(bodyText);
  const reply: string = json?.choices?.[0]?.message?.content ?? "";

  return reply.trim();
}

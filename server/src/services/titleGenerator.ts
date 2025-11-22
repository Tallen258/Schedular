export async function generateTitleFromFirstMessage(firstMessage: string): Promise<string> {
  const prompt = `
Given ONLY the user's first message,
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

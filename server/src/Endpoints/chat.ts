import { Router, type Request, type Response } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const model = (req.body?.model as string) || "gemma3-27b";
    const prompt = req.body?.prompt as string;
    
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "prompt is required" });
    }
    
    const base = process.env.AI_BASE_URL ?? "https://ai-snow.reindeer-pinecone.ts.net";
    const url = `${base}/api/chat/completions`;
    const apiKey = process.env.OPENWEBUI_API_KEY;
    
    const payload = {
      model,
      messages: [{ role: "user", content: prompt }],
    };
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey && apiKey.trim()) headers.Authorization = `Bearer ${apiKey}`;
    
    const upstream = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    
    const bodyText = await upstream.text();
    
    if (!upstream.ok) {
      return res
      .status(upstream.status)
      .type("application/json")
      .send(JSON.stringify({
        title: "Chat provider error",
        detail: bodyText,
        statusCode: upstream.status,
      }));
    }
    
    const json = JSON.parse(bodyText);
    const reply = json?.choices?.[0]?.message?.content ?? "";
    return res.json({ model, reply });
    
  } catch (err) {
    console.error("chat error:", err);
    return res.status(500).json({ error: "chat_failed" });
  }
});

export default router;
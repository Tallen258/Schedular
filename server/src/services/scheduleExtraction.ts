export interface ExtractedEvent {
  title: string;
  startTime: string;
  endTime: string;
  date?: string;
}

const extractionPrompt = `Analyze this calendar/schedule image and extract ALL visible events or appointments.

For each event you find, provide:
- title: The event name/description
- startTime: Start time in HH:MM format (24-hour, e.g., "14:00")
- endTime: End time in HH:MM format (24-hour, e.g., "15:30")
- date: The date in YYYY-MM-DD format (e.g., "2025-11-18")

Return ONLY a valid JSON array. Example:
[
  {
    "title": "Team Meeting",
    "startTime": "09:00",
    "endTime": "10:00",
    "date": "2025-11-18"
  }
]

If you cannot see any events or the image is unclear, return an empty array: []

IMPORTANT: Return ONLY the JSON array, no markdown formatting, no explanations.`;

export async function extractEventsFromScheduleImage(
  imageDataUrl: string
): Promise<ExtractedEvent[]> {
  let aiResponse = "[]";

  try {
    const base = process.env.AI_BASE_URL ?? "https://ai-snow.reindeer-pinecone.ts.net";
    const url = `${base}/api/chat/completions`;
    const apiKey = process.env.OPENWEBUI_API_KEY;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey && apiKey.trim()) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const payload = {
      model: "gemma3-27b",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: extractionPrompt },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      temperature: 0.1,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error("❌ AI API error:", response.status, responseText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const responseJson = JSON.parse(responseText);
    aiResponse = responseJson?.choices?.[0]?.message?.content ?? "[]";
  } catch (err) {
    console.error("AI call failed:", err);
    aiResponse = "[]";
  }

  // Parse / clean response
  try {
    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanedResponse);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (parseErr) {
    console.error("Failed to parse AI response:", aiResponse);
    console.error("Parse error:", parseErr);
    return [];
  }
}

// src/Endpoints/scheduleCompare.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

interface ExtractedEvent {
  title: string;
  startTime: string;
  endTime: string;
  date?: string;
}

interface CompareScheduleRequest {
  date: string;
  workStartHour?: number;
  workEndHour?: number;
  myEvents: Array<{
    title: string;
    start_time: string;
    end_time: string;
  }>;
}

/**
 * POST /api/schedule/compare
 * Upload an image of a calendar/schedule and extract events, then compare with user's calendar
 */
router.post('/compare', upload.single('image'), async (req: Request, res: Response) => {
  console.log('📸 Schedule compare request received');
  try {
    if (!req.file) {
      console.error('❌ No image file in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('✅ Image file received:', req.file.filename);
    console.log('📦 Request body data:', req.body.data);

    const { date, myEvents, workStartHour = 9, workEndHour = 17 } = JSON.parse(req.body.data || '{}') as CompareScheduleRequest;

    if (!date || !myEvents) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ error: 'Missing required fields: date and myEvents' });
    }

    console.log('📅 Date:', date);
    console.log('⏰ Work hours:', workStartHour, '-', workEndHour);
    console.log('📋 My events count:', myEvents.length);

    // Read the uploaded image file
    const imagePath = req.file.path;
    console.log('📂 Image path:', imagePath);

    // Read and convert image to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`;
    console.log('🖼️  Image converted to base64, size:', base64Image.length);

    // Use AI to extract events from the image
    console.log('🤖 Starting AI vision analysis...');

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
  },
  {
    "title": "Lunch Break",
    "startTime": "12:00",
    "endTime": "13:00",
    "date": "2025-11-18"
  }
]

If you cannot see any events or the image is unclear, return an empty array: []

IMPORTANT: Return ONLY the JSON array, no markdown formatting, no explanations.`;

    let aiResponse: string;
    try {
      const base = process.env.AI_BASE_URL ?? "https://ai-snow.reindeer-pinecone.ts.net";
      const url = `${base}/api/chat/completions`;
      const apiKey = process.env.OPENWEBUI_API_KEY;
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey && apiKey.trim()) {
        headers.Authorization = `Bearer ${apiKey}`;
      }

      // Use vision model with image
      const payload = {
        model: "gemma3-27b", // Use the same model as chat
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: extractionPrompt },
              { type: "image_url", image_url: { url: imageDataUrl } }
            ]
          }
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
        console.error('❌ AI API error:', response.status, responseText);
        throw new Error(`AI API error: ${response.status}`);
      }

      const responseJson = JSON.parse(responseText);
      aiResponse = responseJson?.choices?.[0]?.message?.content ?? "[]";
      console.log('✅ AI Response received');
    } catch (aiError) {
      console.error('❌ AI call failed:', aiError);
      // Fallback: return empty events array
      aiResponse = '[]';
    }

    console.log('🤖 AI Response:', aiResponse.substring(0, 200));

    // Parse the extracted events
    let extractedEvents: ExtractedEvent[] = [];
    try {
      // Try to parse the response as JSON
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      extractedEvents = JSON.parse(cleanedResponse);
      console.log('✅ Parsed', extractedEvents.length, 'events from AI response');
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', aiResponse);
      console.error('Parse error:', parseError);
      // Use empty array as fallback
      extractedEvents = [];
    }

    // Convert extracted events to the same format as myEvents for comparison
    const theirEvents = extractedEvents.map(event => ({
      title: event.title,
      start_time: `${event.date || date}T${event.startTime}:00`,
      end_time: `${event.date || date}T${event.endTime}:00`,
    }));

    // Find overlapping time slots and free time slots
    const allEvents = [...myEvents, ...theirEvents];
    
    // Sort all events by start time
    const sortedEvents = allEvents
      .map(e => ({
        ...e,
        start: new Date(e.start_time),
        end: new Date(e.end_time),
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    // Calculate free time slots using provided work hours
    const [year, month, day] = date.split('-').map(Number);
    const dayStart = new Date(year, month - 1, day, workStartHour, 0, 0);
    const dayEnd = new Date(year, month - 1, day, workEndHour, 0, 0);

    const freeSlots: Array<{ start: string; end: string }> = [];
    let currentTime = dayStart;

    for (const event of sortedEvents) {
      if (currentTime < event.start && event.start <= dayEnd) {
        freeSlots.push({
          start: currentTime.toISOString(),
          end: event.start.toISOString(),
        });
      }
      if (event.end > currentTime) {
        currentTime = event.end;
      }
    }

    // Add remaining time after last event
    if (currentTime < dayEnd) {
      freeSlots.push({
        start: currentTime.toISOString(),
        end: dayEnd.toISOString(),
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(imagePath);
    console.log('🗑️  Cleaned up uploaded file');

    const totalFreeHours = freeSlots.reduce((total, slot) => {
      const duration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
      return total + duration / (1000 * 60 * 60);
    }, 0);

    console.log('✅ Sending response:', { extractedCount: theirEvents.length, freeSlotsCount: freeSlots.length, totalFreeHours });

    res.json({
      success: true,
      extractedEvents: theirEvents,
      freeSlots,
      totalFreeHours,
    });
  } catch (error) {
    console.error('Schedule comparison error:', error);
    
    // Clean up file if it exists
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up file:', unlinkError);
      }
    }
    
    res.status(500).json({
      error: 'Failed to analyze schedule image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

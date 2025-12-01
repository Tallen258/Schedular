// src/Endpoints/scheduleCompare.ts
import { Router, Request, Response } from 'express';
import fs from 'fs';
import { uploadScheduleImage } from '../middleware/uploadScheduleImage.js';
import { extractEventsFromScheduleImage } from '../services/scheduleExtraction.js';

const router = Router();

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
router.post('/compare', uploadScheduleImage.single('image'), async (req: Request, res: Response) => {
  console.log('📸 Schedule compare request received');
  try {
    if (!req.file) {
      console.error(' No image file in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log(' Image file received:', req.file.filename);
    console.log(' Request body data:', req.body.data);

    const { date, myEvents, workStartHour = 9, workEndHour = 17 } = JSON.parse(req.body.data || '{}') as CompareScheduleRequest;

    if (!date || !myEvents) {
      console.error(' Missing required fields');
      return res.status(400).json({ error: 'Missing required fields: date and myEvents' });
    }

    console.log('Date:', date);
    console.log('Work hours:', workStartHour, '-', workEndHour);
    console.log('My events count:', myEvents.length);

    // Read the uploaded image file
    const imagePath = req.file.path;
    console.log('Image path:', imagePath);

    // Read and convert image to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    const imageDataUrl = `data:${mimeType};base64,${base64Image}`;
    console.log('Image converted to base64, size:', base64Image.length);

    // Use AI to extract events from the image
    console.log('Starting AI vision analysis...');
    const extractedEvents = await extractEventsFromScheduleImage(imageDataUrl);
    console.log(' Parsed', extractedEvents.length, 'events from AI response');

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
    console.log('  Cleaned up uploaded file');

    const totalFreeHours = freeSlots.reduce((total, slot) => {
      const duration = new Date(slot.end).getTime() - new Date(slot.start).getTime();
      return total + duration / (1000 * 60 * 60);
    }, 0);

    console.log(' Sending response:', { extractedCount: theirEvents.length, freeSlotsCount: freeSlots.length, totalFreeHours });

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

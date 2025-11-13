import { z } from 'zod';

/**
 * Schema for a parsed event from an image
 */
export const ParsedEventSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  title: z.string().min(1, 'Title is required'),
  date: z.string().optional(), // ISO date string
  startTime: z.string().optional(), // HH:MM format
  endTime: z.string().optional(), // HH:MM format
  location: z.string().optional(),
  notes: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(), // OCR confidence score
});

export type ParsedEvent = z.infer<typeof ParsedEventSchema>;

/**
 * Schema for the complete parsed schedule from an image
 */
export const ParsedScheduleSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageFile: z.instanceof(File).optional(),
  rawText: z.string().optional(), // Raw OCR text
  events: z.array(ParsedEventSchema).default([]),
  parsedAt: z.string().datetime().default(() => new Date().toISOString()),
  ownerName: z.string().optional(), // Name of schedule owner
  notes: z.string().optional(), // Additional notes about the schedule
});

export type ParsedSchedule = z.infer<typeof ParsedScheduleSchema>;

/**
 * Schema for schedule comparison request
 */
export const CompareScheduleRequestSchema = z.object({
  myEvents: z.array(ParsedEventSchema),
  theirEvents: z.array(ParsedEventSchema),
  minDuration: z.number().int().positive().default(30), // minutes
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type CompareScheduleRequest = z.infer<typeof CompareScheduleRequestSchema>;

/**
 * Schema for a suggested meeting slot from comparison
 */
export const MeetingSlotSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  duration: z.number().int().positive(),
  score: z.number().min(0).max(1), // 0-1 ranking score
  reason: z.string(), // Why this slot is good
  conflicts: z.array(z.string()).default([]), // IDs of nearby events
});

export type MeetingSlot = z.infer<typeof MeetingSlotSchema>;

/**
 * Schema for schedule comparison response
 */
export const CompareScheduleResponseSchema = z.object({
  suggestedSlots: z.array(MeetingSlotSchema),
  totalConflicts: z.number().int().nonnegative(),
  analysisNotes: z.string().optional(),
});

export type CompareScheduleResponse = z.infer<typeof CompareScheduleResponseSchema>;

import { z } from 'zod';


export const FreeSlotSchema = z.object({
  start: z.string().datetime('Invalid start time'),
  end: z.string().datetime('Invalid end time'),
  duration: z.number().int().positive('Duration must be positive'), 
  reason: z.string().optional(), 
  score: z.number().min(0).max(1).optional(), 
  conflicts: z.array(z.string()).default([]), 
}).refine(
  (data) => {
    const start = new Date(data.start);
    const end = new Date(data.end);
    return end > start;
  },
  {
    message: 'End time must be after start time',
    path: ['end'],
  }
);

export type FreeSlot = z.infer<typeof FreeSlotSchema>;


export const FindFreeSlotsRequestSchema = z.object({
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  minDuration: z.number().int().positive().default(30), 
  workHoursOnly: z.boolean().default(true),
  workStartTime: z.string().regex(/^\d{2}:\d{2}$/).default('09:00'), 
  workEndTime: z.string().regex(/^\d{2}:\d{2}$/).default('17:00'), 
  excludeDays: z.array(z.number().int().min(0).max(6)).default([0, 6]), 
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type FindFreeSlotsRequest = z.infer<typeof FindFreeSlotsRequestSchema>;


export const FindFreeSlotsResponseSchema = z.object({
  slots: z.array(FreeSlotSchema),
  total: z.number().int().nonnegative(),
  requestedDuration: z.number().int().positive(),
});

export type FindFreeSlotsResponse = z.infer<typeof FindFreeSlotsResponseSchema>;

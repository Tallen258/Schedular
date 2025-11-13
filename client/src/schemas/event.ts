import { z } from 'zod';


export const BaseEventSchema = z.object({
  id: z.string().optional(),
  user_email: z.string().email().optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').nullable().optional(),
  location: z.string().max(200, 'Location too long').nullable().optional(),
  start_time: z.string().datetime('Invalid start time format'),
  end_time: z.string().datetime('Invalid end time format'),
  all_day: z.boolean().default(false),
  google_event_id: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const EventSchema = BaseEventSchema.refine(
  (data) => {
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);
    return end > start;
  },
  {
    message: 'End time must be after start time',
    path: ['end_time'],
  }
);

export type Event = z.infer<typeof EventSchema>;
export const CreateEventSchema = BaseEventSchema.pick({
  title: true,
  description: true,
  location: true,
  start_time: true,
  end_time: true,
  all_day: true,
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;

export const UpdateEventSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  all_day: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.start_time && data.end_time) {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      return end > start;
    }
    return true;
  },
  {
    message: 'End time must be after start time',
    path: ['end_time'],
  }
);

export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;

import { z } from 'zod';

export const ActionTypeSchema = z.enum([
  'suggest_free_slots',
  'create_event',
  'reschedule_event',
  'delete_event',
  'compare_schedules',
  'analyze_conflicts',
]);

export type ActionType = z.infer<typeof ActionTypeSchema>;


export const ActionStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'completed',
  'failed',
]);

export type ActionStatus = z.infer<typeof ActionStatusSchema>;


export const ActionLogEntrySchema = z.object({
  id: z.string(),
  user_email: z.string().email(),
  action_type: ActionTypeSchema,
  status: ActionStatusSchema,
  payload: z.record(z.any()), 
  result: z.record(z.any()).nullable().optional(), 
  error_message: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable().optional(),
});

export type ActionLogEntry = z.infer<typeof ActionLogEntrySchema>;


export const CreateActionSchema = z.object({
  action_type: ActionTypeSchema,
  payload: z.record(z.any()),
});

export type CreateActionInput = z.infer<typeof CreateActionSchema>;


export const UpdateActionStatusSchema = z.object({
  id: z.string(),
  status: ActionStatusSchema,
  result: z.record(z.any()).optional(),
  error_message: z.string().optional(),
});

export type UpdateActionStatusInput = z.infer<typeof UpdateActionStatusSchema>;


export const ActionLogResponseSchema = z.object({
  actions: z.array(ActionLogEntrySchema),
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
});

export type ActionLogResponse = z.infer<typeof ActionLogResponseSchema>;

import { describe, it, expect } from 'vitest';
import { EventSchema, CreateEventSchema, UpdateEventSchema } from '../../src/types/event';

describe('Event Schemas', () => {
  describe('EventSchema', () => {
    it('validates a valid event', () => {
      const validEvent = {
        id: '123',
        user_email: 'test@example.com',
        title: 'Team Meeting',
        description: 'Weekly sync',
        location: 'Conference Room A',
        start_time: '2025-11-25T10:00:00Z',
        end_time: '2025-11-25T11:00:00Z',
        all_day: false,
      };

      const result = EventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('rejects event with end_time before start_time', () => {
      const invalidEvent = {
        title: 'Meeting',
        start_time: '2025-11-25T11:00:00Z',
        end_time: '2025-11-25T10:00:00Z',
        all_day: false,
      };

      const result = EventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('End time must be after start time');
      }
    });

    it('requires title', () => {
      const eventWithoutTitle = {
        title: '',
        start_time: '2025-11-25T10:00:00Z',
        end_time: '2025-11-25T11:00:00Z',
        all_day: false,
      };

      const result = EventSchema.safeParse(eventWithoutTitle);
      expect(result.success).toBe(false);
    });

    it('validates email format for user_email', () => {
      const invalidEmail = {
        user_email: 'not-an-email',
        title: 'Meeting',
        start_time: '2025-11-25T10:00:00Z',
        end_time: '2025-11-25T11:00:00Z',
        all_day: false,
      };

      const result = EventSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });

    it('accepts nullable description and location', () => {
      const eventWithNulls = {
        title: 'Meeting',
        description: null,
        location: null,
        start_time: '2025-11-25T10:00:00Z',
        end_time: '2025-11-25T11:00:00Z',
        all_day: false,
      };

      const result = EventSchema.safeParse(eventWithNulls);
      expect(result.success).toBe(true);
    });
  });

  describe('CreateEventSchema', () => {
    it('validates a valid create event input', () => {
      const validInput = {
        title: 'New Meeting',
        description: 'Description',
        location: 'Office',
        start_time: '2025-11-25T10:00:00Z',
        end_time: '2025-11-25T11:00:00Z',
        all_day: false,
      };

      const result = CreateEventSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('requires title for creation', () => {
      const invalidInput = {
        start_time: '2025-11-25T10:00:00Z',
        end_time: '2025-11-25T11:00:00Z',
        all_day: false,
      };

      const result = CreateEventSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateEventSchema', () => {
    it('validates a valid update with all fields', () => {
      const validUpdate = {
        id: '123',
        title: 'Updated Meeting',
        start_time: '2025-11-25T10:00:00Z',
        end_time: '2025-11-25T11:00:00Z',
      };

      const result = UpdateEventSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('validates partial update with only id', () => {
      const partialUpdate = {
        id: '123',
      };

      const result = UpdateEventSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('requires id for updates', () => {
      const updateWithoutId = {
        title: 'Updated Meeting',
      };

      const result = UpdateEventSchema.safeParse(updateWithoutId);
      expect(result.success).toBe(false);
    });

    it('validates time constraint when both times are provided', () => {
      const invalidUpdate = {
        id: '123',
        start_time: '2025-11-25T11:00:00Z',
        end_time: '2025-11-25T10:00:00Z',
      };

      const result = UpdateEventSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it('allows partial time updates', () => {
      const partialTimeUpdate = {
        id: '123',
        start_time: '2025-11-25T10:00:00Z',
      };

      const result = UpdateEventSchema.safeParse(partialTimeUpdate);
      expect(result.success).toBe(true);
    });
  });
});

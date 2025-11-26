import { describe, it, expect } from 'vitest';
import { formatForDatetimeLocal, formatTime, formatDuration } from '../../utils/dateUtils';

describe('dateUtils', () => {
  describe('formatForDatetimeLocal', () => {
    it('formats ISO string to datetime-local format', () => {
      const isoString = '2025-11-25T14:30:00.000Z';
      const result = formatForDatetimeLocal(isoString);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it('pads single digit months and days', () => {
      const isoString = '2025-01-05T09:05:00.000Z';
      const result = formatForDatetimeLocal(isoString);
      expect(result).toMatch(/^\d{4}-01-05T\d{2}:\d{2}$/);
    });
  });

  describe('formatTime', () => {
    it('formats time in 12-hour format with AM/PM', () => {
      const date = new Date('2025-11-25T14:30:00');
      const result = formatTime(date);
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
    });

    it('handles midnight correctly', () => {
      const date = new Date('2025-11-25T00:00:00');
      const result = formatTime(date);
      expect(result).toMatch(/12:00\s?AM/i);
    });

    it('handles noon correctly', () => {
      const date = new Date('2025-11-25T12:00:00');
      const result = formatTime(date);
      expect(result).toMatch(/12:00\s?PM/i);
    });
  });

  describe('formatDuration', () => {
    it('formats duration with only minutes when less than an hour', () => {
      const start = new Date('2025-11-25T14:00:00');
      const end = new Date('2025-11-25T14:45:00');
      expect(formatDuration(start, end)).toBe('45m');
    });

    it('formats duration with only hours when exact hours', () => {
      const start = new Date('2025-11-25T14:00:00');
      const end = new Date('2025-11-25T16:00:00');
      expect(formatDuration(start, end)).toBe('2h');
    });

    it('formats duration with hours and minutes', () => {
      const start = new Date('2025-11-25T14:00:00');
      const end = new Date('2025-11-25T16:30:00');
      expect(formatDuration(start, end)).toBe('2h 30m');
    });

    it('handles zero duration', () => {
      const start = new Date('2025-11-25T14:00:00');
      const end = new Date('2025-11-25T14:00:00');
      expect(formatDuration(start, end)).toBe('0m');
    });
  });
});

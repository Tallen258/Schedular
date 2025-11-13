import type { Event } from '../schemas/event';

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface OverlapResult {
  hasOverlap: boolean;
  conflicts: Event[];
}

/**
 * Check if two time slots overlap
 * Two events overlap if one starts before the other ends AND the other starts before the first ends
 * This includes exact matches and partial overlaps
 */
export function doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  // Use <= to include events that start exactly when another ends
  return slot1.start < slot2.end && slot2.start < slot1.end;
}

/**
 * Check if a new event overlaps with existing events
 */
export function checkEventOverlap(
  newEventStart: string,
  newEventEnd: string,
  existingEvents: Event[]
): OverlapResult {
  const newStart = new Date(newEventStart);
  const newEnd = new Date(newEventEnd);

  // Debug logging
  console.log('Checking overlap for new event:', {
    newEventStart,
    newEventEnd,
    newStartParsed: newStart.toISOString(),
    newEndParsed: newEnd.toISOString(),
    existingEventsCount: existingEvents.length
  });

  const conflicts = existingEvents.filter(event => {
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);
    
    const overlaps = doTimeSlotsOverlap(
      { start: newStart, end: newEnd },
      { start: eventStart, end: eventEnd }
    );

    // Debug each event check
    console.log('Checking event:', {
      title: event.title,
      eventStart: event.start_time,
      eventEnd: event.end_time,
      eventStartParsed: eventStart.toISOString(),
      eventEndParsed: eventEnd.toISOString(),
      overlaps,
      condition1: newStart < eventEnd,
      condition2: eventStart < newEnd
    });
    
    return overlaps;
  });

  console.log('Conflicts found:', conflicts.length);

  return {
    hasOverlap: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Get events for a specific date
 * Compares events in local time to match user's selected date
 */
export function getEventsForDate(events: Event[], targetDate: string): Event[] {
  // Parse the target date as YYYY-MM-DD in local time
  const [year, month, day] = targetDate.split('-').map(Number);
  
  return events.filter(event => {
    const eventStart = new Date(event.start_time);
    
    // Compare in local time
    const eventYear = eventStart.getFullYear();
    const eventMonth = eventStart.getMonth() + 1; // getMonth() is 0-indexed
    const eventDay = eventStart.getDate();
    
    return eventYear === year && eventMonth === month && eventDay === day;
  });
}

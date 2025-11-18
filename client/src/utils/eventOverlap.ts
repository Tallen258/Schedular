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

/**
 * Get all available time slots for a specific date
 * Returns gaps between events and outside of working hours
 * 
 * @param events - All events to consider
 * @param targetDate - Date in YYYY-MM-DD format
 * @param dayStartHour - Start of available hours (default: 0 for midnight)
 * @param dayEndHour - End of available hours (default: 24 for midnight)
 * @returns Array of available time slots
 */
export function getAvailableTimeSlots(
  events: Event[],
  targetDate: string,
  dayStartHour: number = 0,
  dayEndHour: number = 24
): TimeSlot[] {
  const dayEvents = getEventsForDate(events, targetDate);
  
  const [year, month, day] = targetDate.split('-').map(Number);
  
  const dayStart = new Date(year, month - 1, day, dayStartHour, 0, 0, 0);
  const dayEnd = new Date(year, month - 1, day, dayEndHour, 0, 0, 0);
  
  if (dayEvents.length === 0) {
    return [{ start: dayStart, end: dayEnd }];
  }
  
  const sortedEvents = [...dayEvents].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  
  const availableSlots: TimeSlot[] = [];
  let currentTime = dayStart;
  
  for (const event of sortedEvents) {
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);
    
    if (currentTime < eventStart) {
      availableSlots.push({
        start: new Date(currentTime),
        end: new Date(eventStart)
      });
    }
    
    if (eventEnd > currentTime) {
      currentTime = eventEnd;
    }
  }
  
  if (currentTime < dayEnd) {
    availableSlots.push({
      start: new Date(currentTime),
      end: dayEnd
    });
  }
  
  return availableSlots;
}

/**
 * Calculate total available hours for a specific date
 * 
 * @param events - All events to consider
 * @param targetDate - Date in YYYY-MM-DD format
 * @param dayStartHour - Start of available hours (default: 0)
 * @param dayEndHour - End of available hours (default: 24)
 * @returns Total available hours as a number
 */
export function getTotalAvailableHours(
  events: Event[],
  targetDate: string,
  dayStartHour: number = 0,
  dayEndHour: number = 24
): number {
  const availableSlots = getAvailableTimeSlots(events, targetDate, dayStartHour, dayEndHour);
  
  const totalMs = availableSlots.reduce((total, slot) => {
    return total + (slot.end.getTime() - slot.start.getTime());
  }, 0);
  
  // Convert milliseconds to hours
  return totalMs / (1000 * 60 * 60);
}

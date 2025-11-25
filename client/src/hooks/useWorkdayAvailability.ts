import { useMemo } from 'react';
import {
  getEventsForDate,
  getAvailableTimeSlots,
  getTotalAvailableHours,
} from '../utils/eventOverlap';
import { getUserSettings } from '../utils/localStorage';
import type { Event } from '../api/event';

export const useWorkdayAvailability = (events: Event[], selectedDate: string) => {
  const settings = getUserSettings();

  const workStart =
    settings.workStartTime
      ? parseInt(settings.workStartTime.split(':')[0], 10)
      : 9;

  const workEnd =
    settings.workEndTime
      ? parseInt(settings.workEndTime.split(':')[0], 10)
      : 17;

  const dayEvents = useMemo(
    () => getEventsForDate(events, selectedDate),
    [events, selectedDate]
  );

  const availableSlots = useMemo(
    () => getAvailableTimeSlots(events, selectedDate, workStart, workEnd),
    [events, selectedDate, workStart, workEnd]
  );

  const totalAvailableHours = useMemo(
    () => getTotalAvailableHours(events, selectedDate, workStart, workEnd),
    [events, selectedDate, workStart, workEnd]
  );

  return {
    workStart,
    workEnd,
    dayEvents,
    availableSlots,
    totalAvailableHours,
  };
};

import { useState } from 'react';
import toast from 'react-hot-toast';
import { compareScheduleWithImage, type ExtractedEvent, type FreeSlot } from '../api/scheduleCompare';
import type { Event } from '../api/event';

type RecordAction = (key: string, payload: Record<string, unknown>) => void;

interface Params {
  dayEvents: Event[];
  selectedDate: string;
  workStart: number;
  workEnd: number;
  recordAction: RecordAction;
}

export const useAiScheduleCompare = ({
  dayEvents,
  selectedDate,
  workStart,
  workEnd,
  recordAction,
}: Params) => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedEvents, setExtractedEvents] = useState<ExtractedEvent[]>([]);
  const [editableExtractedEvents, setEditableExtractedEvents] = useState<ExtractedEvent[]>([]);
  const [commonFreeSlots, setCommonFreeSlots] = useState<FreeSlot[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [excludeAllDayEvents, setExcludeAllDayEvents] = useState(true);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setExtractedEvents([]);
    setEditableExtractedEvents([]);
    setCommonFreeSlots([]);
    setIsConfirmed(false);
  };

  const handleAnalyzeSchedule = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsAnalyzing(true);
    setIsConfirmed(false);
    setCommonFreeSlots([]);

    const myEvents = dayEvents.map((e) => ({
      title: e.title,
      start_time: e.start_time,
      end_time: e.end_time,
    }));

    const result = await compareScheduleWithImage(
      uploadedImage,
      selectedDate,
      myEvents,
      workStart,
      workEnd
    );

    setExtractedEvents(result.extractedEvents);
    setEditableExtractedEvents(result.extractedEvents);
    setCommonFreeSlots(result.freeSlots);

    recordAction('schedule_analyzed', {
      actionName: 'Schedule Analyzed',
      message: `Extracted ${result.extractedEvents.length} events from image`,
      type: 'success',
      eventsCount: result.extractedEvents.length,
    });

    setIsAnalyzing(false);
  };

  const handleConfirmAndCompare = () => {
    const invalidEvents = editableExtractedEvents.filter((e) => {
      const start = new Date(e.start_time);
      const end = new Date(e.end_time);
      return isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start;
    });

    if (invalidEvents.length > 0) {
      toast.error('Please fix invalid time entries before comparing');
      return;
    }

    const myEventsForDate = dayEvents
      .filter((e) => !excludeAllDayEvents || !e.all_day)
      .map((e) => ({
        start_time: e.start_time,
        end_time: e.end_time,
      }));

    const theirEventsForDate = editableExtractedEvents
      .filter((e) => {
        const eventDate = new Date(e.start_time).toISOString().split('T')[0];
        return eventDate === selectedDate;
      })
      .map((e) => ({
        start_time: e.start_time,
        end_time: e.end_time,
      }));

    const allEvents = [...myEventsForDate, ...theirEventsForDate];

    const sortedEvents = allEvents
      .map((e) => ({
        start: new Date(e.start_time),
        end: new Date(e.end_time),
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const [year, month, day] = selectedDate.split('-').map(Number);
    const dayStart = new Date(year, month - 1, day, workStart, 0, 0);
    const dayEnd = new Date(year, month - 1, day, workEnd, 0, 0);

    const freeSlots: FreeSlot[] = [];
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

    if (currentTime < dayEnd) {
      freeSlots.push({
        start: currentTime.toISOString(),
        end: dayEnd.toISOString(),
      });
    }

    setCommonFreeSlots(freeSlots);
    setIsConfirmed(true);

    recordAction('schedules_compared', {
      actionName: 'Schedules Compared',
      message: `Found ${freeSlots.length} common free time slots`,
      type: 'success',
      slotsCount: freeSlots.length,
    });
  };

  const updateExtractedEvent = (
    index: number,
    field: 'title' | 'start_time' | 'end_time',
    value: string
  ) => {
    setEditableExtractedEvents((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeExtractedEvent = (index: number) => {
    setEditableExtractedEvents((prev) => prev.filter((_, i) => i !== index));
    recordAction('event_removed', {
      actionName: 'Event Removed',
      message: 'Event removed from comparison',
      type: 'info',
    });
  };

  const addExtractedEvent = () => {
    const newEvent: ExtractedEvent = {
      title: 'New Event',
      start_time: `${selectedDate}T09:00:00`,
      end_time: `${selectedDate}T10:00:00`,
    };
    setEditableExtractedEvents((prev) => [...prev, newEvent]);
  };

  return {
    uploadedImage,
    imagePreview,
    isAnalyzing,
    excludeAllDayEvents,
    setExcludeAllDayEvents,
    extractedEvents,
    editableExtractedEvents,
    commonFreeSlots,
    isConfirmed,
    handleImageUpload,
    handleClearImage,
    handleAnalyzeSchedule,
    handleConfirmAndCompare,
    updateExtractedEvent,
    removeExtractedEvent,
    addExtractedEvent,
  };
};

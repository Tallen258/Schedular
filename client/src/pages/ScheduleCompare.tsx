import { useState } from 'react';
import { getEventsForDate, getAvailableTimeSlots, getTotalAvailableHours } from '../utils/eventOverlap';
import { compareScheduleWithImage, type ExtractedEvent, type FreeSlot } from '../api/scheduleCompare';
import { useEvents } from '../hooks/useEvents';
import { getUserSettings } from '../utils/localStorage';
import toast from 'react-hot-toast';
import DateSelector from '../components/scheduleCompare/DateSelector';
import DayEventsList from '../components/scheduleCompare/DayEventsList';
import NewEventsOverlapChecker from '../components/scheduleCompare/NewEventsOverlapChecker';
import ImageUploadSection from '../components/scheduleCompare/ImageUploadSection';
import YourEventsSummary from '../components/scheduleCompare/YourEventsSummary';
import ExtractedEventsEditor from '../components/scheduleCompare/ExtractedEventsEditor';
import CommonFreeSlotsPanel from '../components/scheduleCompare/CommonFreeSlotsPanel';
import AvailableSlotsPanel from '../components/scheduleCompare/AvailableSlotsPanel';

const ScheduleCompare = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [excludeAllDayEvents, setExcludeAllDayEvents] = useState(true); // Default to excluding all-day events
  
  // Image upload states
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedEvents, setExtractedEvents] = useState<ExtractedEvent[]>([]);
  const [editableExtractedEvents, setEditableExtractedEvents] = useState<ExtractedEvent[]>([]);
  const [commonFreeSlots, setCommonFreeSlots] = useState<FreeSlot[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { data: events = [] } = useEvents();
  const dayEvents = getEventsForDate(events, selectedDate);

  // Get user's configured work hours from settings
  const settings = getUserSettings();
  const workStart = settings.workStartTime ? parseInt(settings.workStartTime.split(':')[0]) : 9;
  const workEnd = settings.workEndTime ? parseInt(settings.workEndTime.split(':')[0]) : 17;

  console.log('⏰ Using work hours:', workStart, '-', workEnd, '(from user settings)');

  const availableSlots = getAvailableTimeSlots(events, selectedDate, workStart, workEnd);
  const totalAvailableHours = getTotalAvailableHours(events, selectedDate, workStart, workEnd);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setExtractedEvents([]);
    setCommonFreeSlots([]);
    setIsConfirmed(false);
  };

  const handleAnalyzeSchedule = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    console.log('🔍 Starting schedule analysis...');
    console.log('📅 Selected date:', selectedDate);
    console.log('📋 Day events count:', dayEvents.length);

    setIsAnalyzing(true);
    setIsConfirmed(false);
    setCommonFreeSlots([]);
    
    try {
      const myEvents = dayEvents.map(e => ({
        title: e.title,
        start_time: e.start_time,
        end_time: e.end_time,
      }));

      console.log('📤 Sending request with:', {
        imageSize: uploadedImage.size,
        imageType: uploadedImage.type,
        date: selectedDate,
        eventsCount: myEvents.length
      });

      const result = await compareScheduleWithImage(uploadedImage, selectedDate, myEvents, workStart, workEnd);
      
      console.log('✅ Received result:', result);

      setExtractedEvents(result.extractedEvents);
      setEditableExtractedEvents(result.extractedEvents);
      // Store free slots but don't show them yet - they'll be recalculated on confirm
      setCommonFreeSlots(result.freeSlots);
      
      toast.success(`Extracted ${result.extractedEvents.length} events from image. Please review and confirm.`, {
        duration: 4000,
      });
    } catch (error) {
      console.error(' Failed to analyze schedule:', error);
      toast.error('Failed to analyze the schedule image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAndCompare = () => {
    // Validate extracted events
    const invalidEvents = editableExtractedEvents.filter(e => {
      try {
        const start = new Date(e.start_time);
        const end = new Date(e.end_time);
        return isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start;
      } catch {
        return true;
      }
    });

    if (invalidEvents.length > 0) {
      toast.error('Please fix invalid time entries before comparing');
      return;
    }

    // Filter events to only include the selected date
    const myEventsForDate = dayEvents
      .filter(e => !excludeAllDayEvents || !e.all_day) // Optionally exclude all-day events
      .map(e => ({
        start_time: e.start_time,
        end_time: e.end_time,
      }));

    const theirEventsForDate = editableExtractedEvents
      .filter(e => {
        // Only include events on the selected date
        const eventDate = new Date(e.start_time).toISOString().split('T')[0];
        return eventDate === selectedDate;
      })
      .map(e => ({
        start_time: e.start_time,
        end_time: e.end_time,
      }));

    console.log('📅 Comparing for date:', selectedDate);
    console.log('📋 My events:', myEventsForDate.length);
    console.log('📋 Their events (filtered to date):', theirEventsForDate.length);

    const allEvents = [...myEventsForDate, ...theirEventsForDate];
    
    // Sort all events by start time
    const sortedEvents = allEvents
      .map(e => ({
        start: new Date(e.start_time),
        end: new Date(e.end_time),
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    // Calculate free time slots using user's configured work hours
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dayStart = new Date(year, month - 1, day, workStart, 0, 0);
    const dayEnd = new Date(year, month - 1, day, workEnd, 0, 0);

    const freeSlots: FreeSlot[] = [];
    let currentTime = dayStart;

    console.log('🕒 Day boundaries:', dayStart.toISOString(), 'to', dayEnd.toISOString());
    console.log('📅 Processing', sortedEvents.length, 'events');

    for (const event of sortedEvents) {
      console.log('  Event:', event.start.toISOString(), 'to', event.end.toISOString());
      
      if (currentTime < event.start && event.start <= dayEnd) {
        const slot = {
          start: currentTime.toISOString(),
          end: event.start.toISOString(),
        };
        console.log('  ✅ Free slot:', slot.start, 'to', slot.end);
        freeSlots.push(slot);
      }
      if (event.end > currentTime) {
        currentTime = event.end;
      }
    }

    if (currentTime < dayEnd) {
      const slot = {
        start: currentTime.toISOString(),
        end: dayEnd.toISOString(),
      };
      console.log('  ✅ Final free slot:', slot.start, 'to', slot.end);
      freeSlots.push(slot);
    }

    console.log('✨ Total free slots found:', freeSlots.length);

    setCommonFreeSlots(freeSlots);
    setIsConfirmed(true);
    
    toast.success(`Found ${freeSlots.length} common free time slots!`, {
      duration: 3000,
    });
  };

  const updateExtractedEvent = (index: number, field: 'title' | 'start_time' | 'end_time', value: string) => {
    const updated = [...editableExtractedEvents];
    updated[index] = { ...updated[index], [field]: value };
    setEditableExtractedEvents(updated);
  };

  const removeExtractedEvent = (index: number) => {
    const updated = editableExtractedEvents.filter((_, i) => i !== index);
    setEditableExtractedEvents(updated);
    toast.success('Event removed');
  };

  const addExtractedEvent = () => {
    const newEvent: ExtractedEvent = {
      title: 'New Event',
      start_time: `${selectedDate}T09:00:00`,
      end_time: `${selectedDate}T10:00:00`,
    };
    setEditableExtractedEvents([...editableExtractedEvents, newEvent]);
  };

  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-2xl card p-6">
        <header>
          <div className="itin-header">Event Overlap Checker</div>
          <div className="accent-bar mt-2" />
        </header>

        <div className="mt-6 space-y-6">
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

          <DayEventsList selectedDate={selectedDate} events={dayEvents} />

          <NewEventsOverlapChecker selectedDate={selectedDate} dayEvents={dayEvents} />

          <div className="border border-itin-sand-200 rounded p-4 bg-white">
            <h3 className="font-semibold mb-3">Compare with Another Schedule</h3>
            <p className="text-sm text-itin-sand-600 mb-4">
              Upload a photo of someone else's calendar to find common free time slots.
            </p>
            
            <div className="space-y-4">
              <ImageUploadSection
                uploadedImage={uploadedImage}
                imagePreview={imagePreview}
                isAnalyzing={isAnalyzing}
                onImageUpload={handleImageUpload}
                onClearImage={handleClearImage}
                onAnalyze={handleAnalyzeSchedule}
              />

              {extractedEvents.length > 0 && (
                <div className="space-y-4">
                  <div className="p-3 bg-brand-teal-50 border border-brand-teal-200 rounded-lg">
                    <p className="text-sm text-brand-teal-800 mb-2">
                      ℹ️ Review the extracted events below and confirm to find common free time.
                    </p>
                    <label className="flex items-center gap-2 text-sm text-brand-teal-800 mt-2">
                      <input
                        type="checkbox"
                        checked={excludeAllDayEvents}
                        onChange={(e) => setExcludeAllDayEvents(e.target.checked)}
                        className="h-4 w-4"
                      />
                      Exclude all-day events from comparison
                    </label>
                  </div>

                  <YourEventsSummary events={dayEvents.filter(e => !excludeAllDayEvents || !e.all_day)} />

                  <ExtractedEventsEditor
                    events={editableExtractedEvents}
                    onUpdate={updateExtractedEvent}
                    onRemove={removeExtractedEvent}
                    onAdd={addExtractedEvent}
                  />

                  {!isConfirmed && (
                    <button
                      onClick={handleConfirmAndCompare}
                      className="btn-primary w-full"
                    >
                      ✓ Confirm & Find Common Free Time
                    </button>
                  )}
                </div>
              )}

              {isConfirmed && commonFreeSlots.length > 0 && (
                <CommonFreeSlotsPanel freeSlots={commonFreeSlots} />
              )}
            </div>
          </div>

          <AvailableSlotsPanel
            availableSlots={availableSlots}
            totalAvailableHours={totalAvailableHours}
          />
        </div>
      </section>
    </main>
  );
};

export default ScheduleCompare;

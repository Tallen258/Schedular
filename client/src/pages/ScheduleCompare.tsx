import { useState } from 'react';
import { useAgenticAction } from '../context/AgenticActionContext';
import { useEvents } from '../hooks/useEvents';
import { useWorkdayAvailability } from '../hooks/useWorkdayAvailability';
import { useAiScheduleCompare } from '../hooks/useAiScheduleCompare';

import ModeToggle from '../components/ModeToggle';
import DateSelector from '../components/scheduleCompare/DateSelector';
import DayEventsList from '../components/scheduleCompare/DayEventsList';
import NewEventsOverlapChecker from '../components/scheduleCompare/NewEventsOverlapChecker';
import ImageUploadSection from '../components/scheduleCompare/ImageUploadSection';
import YourEventsSummary from '../components/scheduleCompare/YourEventsSummary';
import ExtractedEventsEditor from '../components/scheduleCompare/ExtractedEventsEditor';
import FreeSlotsDisplay from '../components/scheduleCompare/CommonFreeSlotsPanel';

const ScheduleCompare = () => {
  const { recordAction } = useAgenticAction();
  const [comparisonMode, setComparisonMode] = useState<'manual' | 'ai'>('manual');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { data: events = [] } = useEvents();

  const {
    workStart,
    workEnd,
    dayEvents,
    availableSlots,
  } = useWorkdayAvailability(events, selectedDate);

  const {
    uploadedImage,
    imagePreview,
    isAnalyzing,
    excludeAllDayEvents,
    setExcludeAllDayEvents,
    extractedEvents,
    editableExtractedEvents,
    isConfirmed,
    commonFreeSlots,
    handleImageUpload,
    handleClearImage,
    handleAnalyzeSchedule,
    handleConfirmAndCompare,
    updateExtractedEvent,
    removeExtractedEvent,
    addExtractedEvent,
  } = useAiScheduleCompare({
    dayEvents,
    selectedDate,
    workStart,
    workEnd,
    recordAction,
  });

  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-2xl card p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <div className="itin-header">Event Overlap Checker</div>
            <div className="accent-bar mt-2" />
          </div>
        </header>

        <ModeToggle 
          mode={comparisonMode}
          onModeChange={setComparisonMode}
          manualLabel="Manual Entry"
          aiLabel="AI Image Analysis"
        />

        <div className="mt-6 space-y-6">
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <DayEventsList selectedDate={selectedDate} events={dayEvents} />

          {comparisonMode === 'manual' ? (
            <NewEventsOverlapChecker
              selectedDate={selectedDate}
              dayEvents={dayEvents}
            />
          ) : (
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
                      Review the image events below and confirm they are correct to
                      find common free time.
                    </p>
                    <label className="flex items-center gap-2 text-sm text-brand-teal-800 mt-2">
                      <input
                        type="checkbox"
                        checked={excludeAllDayEvents}
                        onChange={(e) =>
                          setExcludeAllDayEvents(e.target.checked)
                        }
                        className="h-4 w-4"
                      />
                      Exclude all-day events from comparison
                    </label>
                  </div>

                  <YourEventsSummary
                    events={dayEvents.filter(
                      (e) => !excludeAllDayEvents || !e.all_day
                    )}
                  />

                  <ExtractedEventsEditor
                    events={editableExtractedEvents}
                    dayEvents={dayEvents.filter(
                      (e) => !excludeAllDayEvents || !e.all_day
                    )}
                    onUpdate={updateExtractedEvent}
                    onRemove={removeExtractedEvent}
                    onAdd={addExtractedEvent}
                    onConfirm={handleConfirmAndCompare}
                  />
                </div>
              )}

              {isConfirmed && commonFreeSlots.length > 0 && (
                <FreeSlotsDisplay 
                  slots={commonFreeSlots} 
                  title="Common Free Time Slots"
                  variant="common"
                />
              )}
            </div>
          )}

          <FreeSlotsDisplay
            slots={availableSlots}
            title="Available Time Slots"
            variant="available"
            collapsible={true}
            showTotal={true}
          />
        </div>
      </section>
    </main>
  );
};

export default ScheduleCompare;

import { useState } from 'react';
import { useAgenticAction } from '../contexts/AgenticActionContext';
import { useEvents } from '../hooks/useEvents';
import { useWorkdayAvailability } from '../hooks/useWorkdayAvailability';
import { useAiScheduleCompare } from '../hooks/useAiScheduleCompare';

import DateSelector from '../components/scheduleCompare/DateSelector';
import DayEventsList from '../components/scheduleCompare/DayEventsList';
import NewEventsOverlapChecker from '../components/scheduleCompare/NewEventsOverlapChecker';
import ImageUploadSection from '../components/scheduleCompare/ImageUploadSection';
import YourEventsSummary from '../components/scheduleCompare/YourEventsSummary';
import ExtractedEventsEditor from '../components/scheduleCompare/ExtractedEventsEditor';
import CommonFreeSlotsPanel from '../components/scheduleCompare/CommonFreeSlotsPanel';
import AvailableSlotsPanel from '../components/scheduleCompare/AvailableSlotsPanel';

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
    totalAvailableHours,
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

        <div className="mt-6 flex gap-2 p-1 bg-itin-sand-100 rounded-lg w-fit">
          <button
            onClick={() => setComparisonMode('manual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              comparisonMode === 'manual'
                ? 'bg-white text-itin-sand-800 shadow-sm'
                : 'text-itin-sand-600 hover:text-itin-sand-800'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setComparisonMode('ai')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              comparisonMode === 'ai'
                ? 'bg-white text-itin-sand-800 shadow-sm'
                : 'text-itin-sand-600 hover:text-itin-sand-800'
            }`}
          >
            AI Image Analysis
          </button>
        </div>

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
                    onUpdate={updateExtractedEvent}
                    onRemove={removeExtractedEvent}
                    onAdd={addExtractedEvent}
                  />

                  {!isConfirmed && (
                    <button
                      onClick={handleConfirmAndCompare}
                      className="btn-primary w-full"
                    >
                      Confirm &amp; Find Common Free Time
                    </button>
                  )}
                </div>
              )}

              {isConfirmed && commonFreeSlots.length > 0 && (
                <CommonFreeSlotsPanel freeSlots={commonFreeSlots} />
              )}
            </div>
          )}

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

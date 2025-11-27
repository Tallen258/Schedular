import { useState } from 'react';
import type { ExtractedEvent } from '../../api/scheduleCompare';
import type { Event } from '../../api/event';
import { formatForDatetimeLocal } from '../../utils/dateUtils';
import { checkEventOverlap } from '../../utils/eventOverlap';
import toast from 'react-hot-toast';

interface ExtractedEventsEditorProps {
  events: ExtractedEvent[];
  dayEvents: Event[];
  onUpdate: (index: number, field: 'title' | 'start_time' | 'end_time', value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  onConfirm?: () => void;
}

const ExtractedEventsEditor = ({ events, dayEvents, onUpdate, onRemove, onAdd, onConfirm }: ExtractedEventsEditorProps) => {
  const [showConflicts, setShowConflicts] = useState(false);

  const handleCheckConflicts = () => {
    setShowConflicts(true);
    
    let hasAnyConflicts = false;
    events.forEach(event => {
      const result = checkEventOverlap(event.start_time, event.end_time, dayEvents);
      if (result.hasOverlap) {
        hasAnyConflicts = true;
      }
    });

    if (hasAnyConflicts) {
      toast.error('Some extracted events conflict with your schedule!', { duration: 4000 });
    } else {
      toast.success('No conflicts found!', { duration: 3000 });
    }
  };

  const getConflictsForEvent = (event: ExtractedEvent) => {
    if (!showConflicts) return null;
    return checkEventOverlap(event.start_time, event.end_time, dayEvents);
  };
  return (
    <div className="border border-itin-sand-200 rounded p-3 bg-brand-teal-50">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-brand-teal-800">
          Their Events from Image ({events.length})
        </h4>
        <button
          onClick={onAdd}
          className="text-xs btn-secondary py-1 px-2"
        >
          + Add Event
        </button>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-brand-teal-700">No events extracted from the image.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleCheckConflicts}
              className="btn-primary text-sm flex-1"
            >
              Check for Conflicts
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                className="btn-primary text-sm flex-1"
              >
                Find Common Free Time
              </button>
            )}
          </div>
          {events.map((event, index) => {
            const conflictResult = getConflictsForEvent(event);
            return (
            <div key={index} className="border border-brand-teal-200 rounded p-3 bg-white">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <label className="text-xs font-medium text-brand-teal-800">Title</label>
                  <button
                    onClick={() => onRemove(index)}
                    className="text-custom-red-700 hover:text-custom-red-700 text-xs font-semibold"
                  >
                    ✕ Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={event.title}
                  onChange={(e) => onUpdate(index, 'title', e.target.value)}
                  className="form-input w-full text-sm"
                />
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-brand-teal-800">Start Time</label>
                    <input
                      type="datetime-local"
                      value={formatForDatetimeLocal(event.start_time)}
                      onChange={(e) => {
                        const isoString = new Date(e.target.value).toISOString();
                        onUpdate(index, 'start_time', isoString);
                      }}
                      className="form-input w-full text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-brand-teal-800">End Time</label>
                    <input
                      type="datetime-local"
                      value={formatForDatetimeLocal(event.end_time)}
                      onChange={(e) => {
                        const isoString = new Date(e.target.value).toISOString();
                        onUpdate(index, 'end_time', isoString);
                      }}
                      className="form-input w-full text-sm"
                    />
                  </div>
                </div>

                {conflictResult && (
                  <div className={`mt-3 p-3 rounded ${conflictResult.hasOverlap ? 'bg-custom-red-50 border border-custom-red-500' : 'bg-accent-green-50 border border-accent-green-400'}`}>
                    {conflictResult.hasOverlap ? (
                      <>
                        <p className="font-semibold text-custom-red-700 mb-2 text-sm">⚠️ Conflicts ({conflictResult.conflicts.length}):</p>
                        <ul className="text-xs text-custom-red-700 space-y-1">
                          {conflictResult.conflicts.map((evt) => (
                            <li key={evt.id} className="flex justify-between">
                              <span>• {evt.title}</span>
                              <span className="text-custom-red-700 ml-2">
                                {new Date(evt.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                                {new Date(evt.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="text-accent-green-700 font-medium text-sm">✓ No conflicts!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
};

export default ExtractedEventsEditor;

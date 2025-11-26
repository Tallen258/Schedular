import { useState } from 'react';
import type { Event } from '../../api/event';
import { checkEventOverlap } from '../../utils/eventOverlap';
import toast from 'react-hot-toast';

export interface NewEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

interface NewEventsOverlapCheckerProps {
  selectedDate: string;
  dayEvents: Event[];
}

const NewEventsOverlapChecker = ({ selectedDate, dayEvents }: NewEventsOverlapCheckerProps) => {
  const [newEvents, setNewEvents] = useState<NewEvent[]>([
    { id: crypto.randomUUID(), title: '', startTime: '', endTime: '' }
  ]);
  const [showOverlapResults, setShowOverlapResults] = useState(false);

  const addNewEvent = () => {
    setNewEvents([...newEvents, { id: crypto.randomUUID(), title: '', startTime: '', endTime: '' }]);
  };

  const removeEvent = (id: string) => {
    if (newEvents.length > 1) {
      setNewEvents(newEvents.filter(e => e.id !== id));
    }
  };

  const updateEvent = (id: string, field: keyof Omit<NewEvent, 'id'>, value: string) => {
    setNewEvents(newEvents.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleCheckOverlap = () => {
    // Validate all events
    const invalidEvents = newEvents.filter(e => !e.title || !e.startTime || !e.endTime);
    if (invalidEvents.length > 0) {
      toast.error('Please fill in all fields for each event');
      return;
    }

    const invalidTimes = newEvents.filter(e => e.endTime <= e.startTime);
    if (invalidTimes.length > 0) {
      toast.error('End time must be after start time for all events');
      return;
    }

    setShowOverlapResults(true);

    // Check each event against existing events
    let hasAnyConflicts = false;

    newEvents.forEach(newEvent => {
      const startDateTime = `${selectedDate}T${newEvent.startTime}`;
      const endDateTime = `${selectedDate}T${newEvent.endTime}`;
      const result = checkEventOverlap(startDateTime, endDateTime, dayEvents);
      
      if (result.hasOverlap) {
        hasAnyConflicts = true;
      }
    });

    if (hasAnyConflicts) {
      toast.error(`Conflicts detected with existing events!`, {
        duration: 4000,
      });
    } else {
      toast.success(`All ${newEvents.length} event(s) are conflict-free!`, {
        duration: 3000,
      });
    }
  };

  // Calculate overlap results for each new event
  const getOverlapResult = (event: NewEvent) => {
    if (!event.startTime || !event.endTime || event.endTime <= event.startTime) {
      return null;
    }
    return checkEventOverlap(
      `${selectedDate}T${event.startTime}`,
      `${selectedDate}T${event.endTime}`,
      dayEvents
    );
  };

  return (
    <div className="border border-itin-sand-200 rounded p-4 bg-white">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Check New Events ({newEvents.length})</h3>
        <button onClick={addNewEvent} className="btn-secondary text-sm">
          + Add Event
        </button>
      </div>
      
      <div className="space-y-4">
        {newEvents.map((event, index) => {
          const overlapResult = getOverlapResult(event);
          const hasInvalidTime = event.startTime && event.endTime && event.endTime <= event.startTime;
          
          return (
            <div key={event.id} className="border border-itin-sand-200 rounded p-3 bg-itin-sand-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-itin-sand-700">Event {index + 1}</span>
                {newEvents.length > 1 && (
                  <button
                    onClick={() => removeEvent(event.id)}
                    className="text-custom-red-700 hover:text-custom-red-700 text-sm font-semibold"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Event Title</label>
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) => updateEvent(event.id, 'title', e.target.value)}
                    className="form-input w-full"
                    placeholder="Meeting title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Start Time</label>
                    <input
                      type="time"
                      value={event.startTime}
                      onChange={(e) => updateEvent(event.id, 'startTime', e.target.value)}
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">End Time</label>
                    <input
                      type="time"
                      value={event.endTime}
                      onChange={(e) => updateEvent(event.id, 'endTime', e.target.value)}
                      className="form-input w-full"
                    />
                  </div>
                </div>

                {showOverlapResults && overlapResult && event.endTime > event.startTime && (
                  <div className={`p-3 rounded ${overlapResult.hasOverlap ? 'bg-custom-red-50 border border-custom-red-500' : 'bg-accent-green-50 border border-accent-green-400'}`}>
                    {overlapResult.hasOverlap ? (
                      <>
                        <p className="font-semibold text-custom-red-700 mb-2 text-sm">⚠️ Conflicts ({overlapResult.conflicts.length}):</p>
                        <ul className="text-xs text-custom-red-700 space-y-1">
                          {overlapResult.conflicts.map((evt) => (
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
                
                {hasInvalidTime && (
                  <div className="p-2 rounded bg-itin-sand-100 border border-itin-sand-300">
                    <p className="text-itin-sand-700 text-xs">⚠️ End time must be after start time</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        <button onClick={handleCheckOverlap} className="btn-primary w-full">
          Check All Events for Overlaps
        </button>
      </div>
    </div>
  );
};

export default NewEventsOverlapChecker;

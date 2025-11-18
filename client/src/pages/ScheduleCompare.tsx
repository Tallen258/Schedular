import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Event } from '../schemas/event';
import { checkEventOverlap, getEventsForDate, getAvailableTimeSlots, getTotalAvailableHours } from '../utils/eventOverlap';
import api from '../services/api';
import toast from 'react-hot-toast';

interface NewEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

const ScheduleCompare = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAvailableSlots, setShowAvailableSlots] = useState(false);
  const [newEvents, setNewEvents] = useState<NewEvent[]>([
    { id: crypto.randomUUID(), title: '', startTime: '', endTime: '' }
  ]);

  const { data: eventsData } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get<{ events: Event[] }>('/api/events');
      return response.data;
    },
  });

  const events = eventsData?.events || [];
  const dayEvents = getEventsForDate(events, selectedDate);

  const availableSlots = getAvailableTimeSlots(events, selectedDate, 9, 17);
  const totalAvailableHours = getTotalAvailableHours(events, selectedDate, 9, 17);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (start: Date, end: Date) => {
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes}m`;
    }
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  };

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

    // Check each event against existing events
    let hasAnyConflicts = false;
    let totalConflicts = 0;

    newEvents.forEach(newEvent => {
      const startDateTime = `${selectedDate}T${newEvent.startTime}`;
      const endDateTime = `${selectedDate}T${newEvent.endTime}`;
      const result = checkEventOverlap(startDateTime, endDateTime, dayEvents);
      
      if (result.hasOverlap) {
        hasAnyConflicts = true;
        totalConflicts += result.conflicts.length;
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
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-2xl card p-6">
        <header>
          <div className="itin-header">Event Overlap Checker</div>
          <div className="accent-bar mt-2" />
        </header>

        <div className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-input w-full"
            />
          </div>

          <div className="border border-itin-sand-200 rounded p-4 bg-white">
            <h3 className="font-semibold mb-3">Events on {selectedDate} ({dayEvents.length})</h3>
            {dayEvents.length === 0 ? (
              <p className="text-sm text-itin-sand-600">No events scheduled</p>
            ) : (
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <div key={event.id} className="text-sm border-l-2 border-itin-sage-500 pl-3 py-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-itin-sand-600">
                      {new Date(event.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} -
                      {new Date(event.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
                          className="text-red-600 hover:text-red-800 text-sm"
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

                      {overlapResult && event.endTime > event.startTime && (
                        <div className={`p-3 rounded ${overlapResult.hasOverlap ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                          {overlapResult.hasOverlap ? (
                            <>
                              <p className="font-semibold text-red-800 mb-2 text-sm">⚠️ Conflicts ({overlapResult.conflicts.length}):</p>
                              <ul className="text-xs text-red-700 space-y-1">
                                {overlapResult.conflicts.map((evt) => (
                                  <li key={evt.id} className="flex justify-between">
                                    <span>• {evt.title}</span>
                                    <span className="text-red-600 ml-2">
                                      {new Date(evt.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                                      {new Date(evt.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <p className="text-green-800 font-medium text-sm">✓ No conflicts!</p>
                          )}
                        </div>
                      )}
                      
                      {hasInvalidTime && (
                        <div className="p-2 rounded bg-yellow-50 border border-yellow-200">
                          <p className="text-yellow-800 text-xs">⚠️ End time must be after start time</p>
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

          <div className="border border-itin-sand-200 rounded p-4 bg-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Available Time Slots</h3>
              <button
                onClick={() => setShowAvailableSlots(!showAvailableSlots)}
                className="btn-secondary text-sm"
              >
                {showAvailableSlots ? 'Hide' : 'Show'} Available Slots
              </button>
            </div>
            
            {showAvailableSlots && (
              <div className="space-y-3">
                {availableSlots.length === 0 ? (
                  <div className="text-itin-sand-700 p-4 bg-itin-sand-100 rounded-lg">
                    No available time slots during working hours (9:00 AM - 5:00 PM).
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {availableSlots.map((slot, index) => (
                        <div
                          key={index}
                          className="border border-itin-sand-200 rounded-lg p-3 hover:border-itin-orange-400 transition-colors bg-green-50"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-semibold text-green-800">
                                Free from {formatTime(slot.start)} til {formatTime(slot.end)}
                              </div>
                              <div className="text-sm text-itin-sand-600 mt-1">
                                Duration: {formatDuration(slot.start, slot.end)}
                              </div>
                            </div>
                            <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                              Available
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-3 bg-itin-orange-50 border border-itin-orange-200 rounded-lg text-center">
                      <span className="font-semibold text-itin-orange-800">
                        Total: {totalAvailableHours.toFixed(1)} hours free
                      </span>
                      <span className="text-sm text-itin-sand-600 ml-2">
                        ({availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ScheduleCompare;

import { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { getAvailableTimeSlots, getTotalAvailableHours } from '../utils/eventOverlap';
import Spinner from './Spinner';

interface AvailableTimeSlotsProps {
  targetDate?: string;
  dayStartHour?: number;
  dayEndHour?: number;
}

const AvailableTimeSlots = ({
  targetDate,
  dayStartHour = 9,
  dayEndHour = 17,
}: AvailableTimeSlotsProps) => {
  const { data: events, isLoading, error } = useEvents();
  const [selectedDate, setSelectedDate] = useState<string>(
    targetDate || new Date().toISOString().split('T')[0]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-custom-red-700">
        Failed to load time slots: {error.message}
      </div>
    );
  }

  const availableSlots = events 
    ? getAvailableTimeSlots(events, selectedDate, dayStartHour, dayEndHour)
    : [];
  
  const totalHours = events
    ? getTotalAvailableHours(events, selectedDate, dayStartHour, dayEndHour)
    : 0;

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="date-select" className="block text-sm font-medium text-itin-sand-700 mb-2">
          Select Date
        </label>
        <input
          id="date-select"
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="px-3 py-2 border border-itin-sand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-itin-sand-500"
        />
      </div>

      {availableSlots.length === 0 ? (
        <div className="text-itin-sand-700 p-4 bg-itin-sand-100 rounded-lg">
          No available time slots for this day during working hours ({dayStartHour}:00 - {dayEndHour}:00).
        </div>
      ) : (
        <>
          <div className="mb-4 p-3 bg-itin-sand-100 border border-itin-sand-300 rounded-lg">
            <span className="font-semibold text-itin-sand-700">
              Total Available: {totalHours.toFixed(1)} hours
            </span>
            <span className="text-sm text-itin-sand-600 ml-2">
              ({availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''})
            </span>
          </div>

          <div className="space-y-3">
            {availableSlots.map((slot, index) => (
              <div
                key={index}
                className="border border-itin-sand-200 rounded-lg p-4 hover:border-itin-sand-400 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-itin-sand-800">
                      {formatTime(slot.start)} - {formatTime(slot.end)}
                    </div>
                    <div className="text-sm text-itin-sand-600 mt-1">
                      Duration: {formatDuration(slot.start, slot.end)}
                    </div>
                  </div>
                  <div className="text-xs text-itin-sand-500 bg-itin-sand-100 px-2 py-1 rounded">
                    Slot {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AvailableTimeSlots;

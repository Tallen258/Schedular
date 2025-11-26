import { useState } from 'react';
import { formatTime, formatDuration } from '../../utils/dateUtils';

interface TimeSlot {
  start: Date | string;
  end: Date | string;
}

interface FreeSlotsDisplayProps {
  slots: TimeSlot[];
  title?: string;
  variant?: 'available' | 'common';
  collapsible?: boolean;
  showTotal?: boolean;
}

const FreeSlotsDisplay = ({ 
  slots, 
  title = 'Free Time Slots',
  variant = 'available',
  collapsible = false,
  showTotal = false
}: FreeSlotsDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  const isCommon = variant === 'common';
  const borderColor = isCommon ? 'border-accent-green-400' : 'border-itin-sand-200';
  const bgColor = isCommon ? 'bg-accent-green-50' : 'bg-white';
  const textColor = isCommon ? 'text-accent-green-900' : 'text-itin-sand-900';
  const slotBorderColor = isCommon ? 'border-accent-green-600' : 'border-itin-sand-200';
  const slotTextColor = isCommon ? 'text-accent-green-700' : 'text-accent-green-700';
  const slotBgColor = isCommon ? 'bg-white' : 'bg-accent-green-50';

  const totalHours = slots.reduce((acc, slot) => {
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  if (slots.length === 0 && !isCommon) {
    return (
      <div className={`border ${borderColor} rounded p-4 ${bgColor}`}>
        <h4 className={`font-semibold ${textColor} mb-3`}>{title}</h4>
        <div className="text-itin-sand-700 p-4 bg-itin-sand-100 rounded-lg">
          No available time slots during working hours (9:00 AM - 5:00 PM).
        </div>
      </div>
    );
  }

  return (
    <div className={`border ${borderColor} rounded p-4 ${bgColor}`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className={`font-semibold ${textColor}`}>
          {isCommon && '✓ '}{title} ({slots.length})
        </h4>
        {collapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-secondary text-sm"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="space-y-2">
          {slots.map((slot, index) => {
            const start = new Date(slot.start);
            const end = new Date(slot.end);
            return (
              <div
                key={index}
                className={`border ${slotBorderColor} rounded-lg p-3 ${slotBgColor}`}
              >
                <div className={`font-semibold ${slotTextColor}`}>
                  Free from {formatTime(start)} til {formatTime(end)}
                </div>
                <div className="text-sm text-itin-sand-600 mt-1">
                  Duration: {formatDuration(start, end)}
                </div>
              </div>
            );
          })}
          
          {showTotal && (
            <div className="p-3 bg-itin-sand-100 border border-itin-sand-300 rounded-lg text-center">
              <span className="font-semibold text-itin-sand-700">
                Total: {totalHours.toFixed(1)} hours free
              </span>
              <span className="text-sm text-itin-sand-600 ml-2">
                ({slots.length} slot{slots.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FreeSlotsDisplay;

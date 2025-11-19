import { useState } from 'react';
import { formatTime, formatDuration } from '../../utils/dateUtils';

interface TimeSlot {
  start: Date;
  end: Date;
}

interface AvailableSlotsPanelProps {
  availableSlots: TimeSlot[];
  totalAvailableHours: number;
}

const AvailableSlotsPanel = ({ availableSlots, totalAvailableHours }: AvailableSlotsPanelProps) => {
  const [showAvailableSlots, setShowAvailableSlots] = useState(false);

  return (
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
  );
};

export default AvailableSlotsPanel;

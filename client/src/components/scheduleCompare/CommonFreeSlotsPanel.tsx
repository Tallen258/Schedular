import type { FreeSlot } from '../../api/scheduleCompare';
import { formatTime, formatDuration } from '../../utils/dateUtils';

interface CommonFreeSlotsPanelProps {
  freeSlots: FreeSlot[];
}

const CommonFreeSlotsPanel = ({ freeSlots }: CommonFreeSlotsPanelProps) => {
  return (
    <div className="border border-green-300 rounded p-4 bg-green-50">
      <h4 className="font-semibold text-green-900 mb-3">
        ✓ Common Free Time Slots ({freeSlots.length})
      </h4>
      <div className="space-y-2">
        {freeSlots.map((slot, index) => {
          const start = new Date(slot.start);
          const end = new Date(slot.end);
          return (
            <div
              key={index}
              className="border border-green-400 rounded-lg p-3 bg-white"
            >
              <div className="font-semibold text-green-800">
                Free from {formatTime(start)} til {formatTime(end)}
              </div>
              <div className="text-sm text-itin-sand-600 mt-1">
                Duration: {formatDuration(start, end)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommonFreeSlotsPanel;

import type { ExtractedEvent } from '../../api/scheduleCompare';
import { formatForDatetimeLocal } from '../../utils/dateUtils';

interface ExtractedEventsEditorProps {
  events: ExtractedEvent[];
  onUpdate: (index: number, field: 'title' | 'start_time' | 'end_time', value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}

const ExtractedEventsEditor = ({ events, onUpdate, onRemove, onAdd }: ExtractedEventsEditorProps) => {
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
          {events.map((event, index) => (
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
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
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
                  <div>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExtractedEventsEditor;

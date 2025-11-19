import type { Event } from '../../api/event';

interface DayEventsListProps {
  selectedDate: string;
  events: Event[];
}

const DayEventsList = ({ selectedDate, events }: DayEventsListProps) => {
  return (
    <div className="border border-itin-sand-200 rounded p-4 bg-white">
      <h3 className="font-semibold mb-3">Events on {selectedDate} ({events.length})</h3>
      {events.length === 0 ? (
        <p className="text-sm text-itin-sand-600">No events scheduled</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
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
  );
};

export default DayEventsList;

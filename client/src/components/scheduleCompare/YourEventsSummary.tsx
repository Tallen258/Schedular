import type { Event } from '../../api/event';

interface YourEventsSummaryProps {
  events: Event[];
}

const YourEventsSummary = ({ events }: YourEventsSummaryProps) => {
  return (
    <div className="border border-itin-sand-200 rounded p-3 bg-itin-sand-50">
      <h4 className="font-semibold text-itin-sand-900 mb-2">
        Your Events ({events.length})
      </h4>
      {events.length === 0 ? (
        <p className="text-sm text-itin-sand-600">No events scheduled</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="text-sm border-l-2 border-accent-green-600 pl-3 py-1">
              <div className="font-medium text-itin-sand-900">{event.title}</div>
              <div className="text-itin-sand-600">
                {new Date(event.start_time).toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit', 
                  minute: '2-digit' 
                })} - {new Date(event.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YourEventsSummary;

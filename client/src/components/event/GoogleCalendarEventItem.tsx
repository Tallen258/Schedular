import type { GoogleCalendarEvent } from "../../api/googleCalendar";

interface GoogleCalendarEventItemProps {
  event: GoogleCalendarEvent;
  isImporting: boolean;
  onImport: (eventId: string) => void;
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function GoogleCalendarEventItem({ event, isImporting, onImport }: GoogleCalendarEventItemProps) {
  return (
    <li className="p-4 bg-custom-white border-2 border-itin-sand-200 rounded-xl shadow-sm hover:shadow-md hover:border-itin-sand-300 transition-all">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-itin-sand-800">{event.summary}</h4>
          <div className="flex gap-4 mt-2 text-sm text-itin-sand-700">
            <span>{formatDate(event.start)} → {formatDate(event.end)}</span>
          </div>
          {event.location && (
            <div className="text-sm mt-1 text-itin-sand-600">📍 {event.location}</div>
          )}
          {event.hangoutLink && (
            <div className="text-sm mt-1">
              <span className="text-itin-sand-600">📹 Meet: </span>
              <a className="underline text-accent-green-700 hover:text-accent-green-600 font-medium"
                href={event.hangoutLink} target="_blank" rel="noopener noreferrer">
                Join link
              </a>
            </div>
          )}
          {event.attendees && event.attendees.length > 0 && (
            <div className="text-sm mt-1 text-itin-sand-600">
              👥 {event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <button
          onClick={() => onImport(event.id)}
          disabled={isImporting}
          className="px-3 py-2 rounded-xl bg-accent-green-700 text-itin-sand-50 text-sm hover:bg-accent-green-600 transition-colors disabled:opacity-50 font-semibold whitespace-nowrap"
        >
          {isImporting ? '✓ Imported' : 'Import'}
        </button>
      </div>
    </li>
  );
}

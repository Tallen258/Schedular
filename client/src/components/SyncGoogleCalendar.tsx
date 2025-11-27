import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { 
  startGoogleCalendarAuth,
  getGoogleCalendarEvents,
  syncGoogleCalendarEvents, 
  importGoogleCalendarEvent,
  type GoogleCalendarEvent
} from "../api/googleCalendar";
import { useQueryClient } from "@tanstack/react-query";

interface SyncGoogleCalendarProps {
  onEventsLoaded?: (events: GoogleCalendarEvent[]) => void;
}

const SyncGoogleCalendar: React.FC<SyncGoogleCalendarProps> = ({ onEventsLoaded }) => {
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    imported: number;
    skipped: number;
    total: number;
  } | null>(null);
  const [importingEvents, setImportingEvents] = useState<Set<string>>(new Set());

  async function loadEvents() {
    setLoading(true);
    setError(null);
    console.log('Loading events from Google Calendar');
    try {
      const googleEvents = await getGoogleCalendarEvents();
      console.log('Received events:', googleEvents);
      setEvents(googleEvents);
      if (onEventsLoaded) {
        onEventsLoaded(googleEvents);
      }
    } catch (e: unknown) {
      const error = e as Error;
      setError(error.message ?? "Failed to load events");
      console.error('Error loading events:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Auto-load if linked=1 is in the URL (came back from callback)
    const params = new URLSearchParams(window.location.search);
    if (params.get("linked") === "1") {
      void loadEvents();
      setIsExpanded(true);
    }
    // loadEvents is intentionally not in deps - only run on mount when URL has linked=1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connectGoogle() {
    try {
      const { url } = await startGoogleCalendarAuth();
      window.location.href = url;
    } catch (e: unknown) {
      const error = e as Error;
      setError(error.message ?? "Failed to start Google link");
      console.error('Error connecting to Google:', e);
    }
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

  async function syncAllEvents() {
    setSyncing(true);
    setSyncResult(null);
    setError(null);
    try {
      const result = await syncGoogleCalendarEvents();
      setSyncResult({
        imported: result.imported,
        skipped: result.skipped,
        total: result.total,
      });
      // Refresh the events list on the calendar
      queryClient.invalidateQueries({ queryKey: ['events'] });
      // Show success message
      setTimeout(() => setSyncResult(null), 5000);
    } catch (e: unknown) {
      const error = e as Error;
      setError(error.message ?? "Failed to sync events");
      console.error('Error syncing events:', e);
    } finally {
      setSyncing(false);
    }
  }

  async function importSingleEvent(eventId: string) {
    setImportingEvents(prev => new Set(prev).add(eventId));
    setError(null);
    try {
      await importGoogleCalendarEvent(eventId);
      // Refresh the events list on the calendar
      queryClient.invalidateQueries({ queryKey: ['events'] });
      // Remove the event from the importing set after a short delay
      setTimeout(() => {
        setImportingEvents(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
      }, 1000);
    } catch (e: unknown) {
      const error = e as Error;
      setError(error.message ?? "Failed to import event");
      console.error('Error importing event:', e);
      setImportingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  }

  return (
    <div className="card p-6 mb-6 bg-gradient-to-r from-itin-sand-50 to-blue-white border-2 border-itin-sand-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-itin-sand-800">
          🔗 Google Calendar Sync
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-itin-sand-600 hover:text-itin-sand-800 transition-colors focus:outline-none"
          style={{ color: 'var(--color-itin-sand-600)' }}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              className="px-4 py-2 rounded-xl bg-accent-green-700 text-itin-sand-50 hover:bg-accent-green-600 transition-colors font-semibold"
              onClick={connectGoogle}
            >
              🔐 Connect Google Calendar
            </button>

            <button
              className="px-4 py-2 rounded-xl bg-itin-sand-600 text-itin-sand-50 hover:bg-itin-sand-700 transition-colors font-semibold disabled:opacity-50"
              onClick={loadEvents}
              disabled={loading}
            >
              🔄 Refresh Events
            </button>

            {events.length > 0 && (
              <button
                className="px-4 py-2 rounded-xl bg-accent-green-600 text-itin-sand-50 hover:bg-accent-green-700 transition-colors font-semibold disabled:opacity-50"
                onClick={syncAllEvents}
                disabled={syncing || loading}
              >
                {syncing ? '⏳ Importing...' : '📥 Import All to Calendar'}
              </button>
            )}
          </div>

          {syncResult && (
            <div className="p-4 mb-4 bg-accent-green-50 border-2 border-accent-green-400 text-accent-green-900 rounded-xl">
              ✅ Successfully imported {syncResult.imported} of {syncResult.total} events
              {syncResult.skipped > 0 && ` (${syncResult.skipped} skipped)`}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-itin-sand-700">
              <Spinner />
            </div>
          )}

          {error && (
            <div className="p-4 bg-custom-red-50 border-2 border-custom-red-500 text-custom-red-700 rounded-xl">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <p className="text-itin-sand-700">
              No upcoming Google Calendar events found. Click "Connect Google Calendar" to link your account.
            </p>
          )}

          {!loading && !error && events.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-itin-sand-800 mb-3">
                Upcoming Google Calendar Events ({events.length})
              </h3>
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {events.map(ev => {
                  const isImporting = importingEvents.has(ev.id);
                  return (
                    <li 
                      key={ev.id} 
                      className="p-4 bg-custom-white border-2 border-itin-sand-200 rounded-xl shadow-sm hover:shadow-md hover:border-itin-sand-300 transition-all"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-itin-sand-800">
                            {ev.summary}
                          </h4>
                          <div className="flex gap-4 mt-2 text-sm text-itin-sand-700">
                            <span>📅 {formatDate(ev.start)} → {formatDate(ev.end)}</span>
                          </div>
                          {ev.location && (
                            <div className="text-sm mt-1 text-itin-sand-600">
                              📍 {ev.location}
                            </div>
                          )}
                          {ev.hangoutLink && (
                            <div className="text-sm mt-1">
                              <span className="text-itin-sand-600">📹 Meet: </span>
                              <a 
                                className="underline text-accent-green-700 hover:text-accent-green-600 font-medium" 
                                href={ev.hangoutLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                Join link
                              </a>
                            </div>
                          )}
                          {ev.attendees && ev.attendees.length > 0 && (
                            <div className="text-sm mt-1 text-itin-sand-600">
                              👥 {ev.attendees.length} attendee{ev.attendees.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => importSingleEvent(ev.id)}
                          disabled={isImporting}
                          className="px-3 py-2 rounded-xl bg-accent-green-700 text-itin-sand-50 text-sm hover:bg-accent-green-600 transition-colors disabled:opacity-50 font-semibold whitespace-nowrap"
                        >
                          {isImporting ? '✓ Imported' : '📥 Import'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SyncGoogleCalendar;

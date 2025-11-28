import { useEffect, useState } from "react";
import Spinner from "../Spinner";
import GoogleCalendarEventItem from "./GoogleCalendarEventItem";
import { startGoogleCalendarAuth, getGoogleCalendarEvents, syncGoogleCalendarEvents, 
  importGoogleCalendarEvent, type GoogleCalendarEvent } from "../../api/googleCalendar";
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
  const [syncResult, setSyncResult] = useState<{ imported: number; skipped: number; total: number } | null>(null);
  const [importingEvents, setImportingEvents] = useState<Set<string>>(new Set());

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const googleEvents = await getGoogleCalendarEvents();
      setEvents(googleEvents);
      onEventsLoaded?.(googleEvents);
    } catch (e) {
      setError((e as Error).message ?? "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("linked") === "1") {
      void loadEvents();
      setIsExpanded(true);
    }
  }, []);

  const connectGoogle = async () => {
    try {
      const { url } = await startGoogleCalendarAuth();
      window.location.href = url;
    } catch (e) {
      setError((e as Error).message ?? "Failed to start Google link");
    }
  };

  const syncAllEvents = async () => {
    setSyncing(true);
    setSyncResult(null);
    setError(null);
    try {
      const result = await syncGoogleCalendarEvents();
      setSyncResult({ imported: result.imported, skipped: result.skipped, total: result.total });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setTimeout(() => setSyncResult(null), 5000);
    } catch (e) {
      setError((e as Error).message ?? "Failed to sync events");
    } finally {
      setSyncing(false);
    }
  };

  const importSingleEvent = async (eventId: string) => {
    setImportingEvents(prev => new Set(prev).add(eventId));
    setError(null);
    try {
      await importGoogleCalendarEvent(eventId);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setTimeout(() => setImportingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      }), 1000);
    } catch (e) {
      setError((e as Error).message ?? "Failed to import event");
      setImportingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  return (
    <div className="card p-6 mb-6 bg-gradient-to-r from-itin-sand-50 to-blue-white border-2 border-itin-sand-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-itin-sand-800">
          Google Calendar Sync
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-itin-sand-600 hover:text-itin-sand-800 transition-colors focus:outline-none"
          style={{ color: 'var(--color-itin-sand-600)' }}
        >
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              className="px-4 py-2 rounded-xl bg-accent-green-700 text-itin-sand-50 hover:bg-accent-green-600 transition-colors font-semibold"
              onClick={connectGoogle}
            >
              Connect Google Calendar
            </button>

            <button
              className="px-4 py-2 rounded-xl bg-itin-sand-600 text-itin-sand-50 hover:bg-itin-sand-700 transition-colors font-semibold disabled:opacity-50"
              onClick={loadEvents}
              disabled={loading}
            >
              Refresh Events
            </button>

            {events.length > 0 && (
              <button
                className="px-4 py-2 rounded-xl bg-accent-green-600 text-itin-sand-50 hover:bg-accent-green-700 transition-colors font-semibold disabled:opacity-50"
                onClick={syncAllEvents}
                disabled={syncing || loading}
              >
                {syncing ? 'Importing...' : 'Import All to Calendar'}
              </button>
            )}
          </div>

          {syncResult && (
            <div className="p-4 mb-4 bg-accent-green-50 border-2 border-accent-green-400 text-accent-green-900 rounded-xl">
              Successfully imported {syncResult.imported} of {syncResult.total} events
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
                {events.map(ev => (
                  <GoogleCalendarEventItem
                    key={ev.id}
                    event={ev}
                    isImporting={importingEvents.has(ev.id)}
                    onImport={importSingleEvent}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SyncGoogleCalendar;

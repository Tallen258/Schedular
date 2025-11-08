import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { syncGoogleCalendarEvents, importGoogleCalendarEvent } from "../api/event";
import { useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type GoogleEventItem = {
  id: string;
  summary: string;
  start: string | null;
  end: string | null;
  location: string | null;
  attendees: { email: string; responseStatus?: string }[];
  hangoutLink: string | null;
};

interface SyncGoogleCalendarProps {
  onEventsLoaded?: (events: GoogleEventItem[]) => void;
}

const SyncGoogleCalendar: React.FC<SyncGoogleCalendarProps> = ({ onEventsLoaded }) => {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<GoogleEventItem[]>([]);
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
      const token = auth?.user?.access_token;
      const r = await fetch(`${API_BASE}/api/google/calendar/upcoming`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      if (!r.ok) {
        const text = await r.text();
        let errorMsg = text || r.statusText;
        try {
          const json = JSON.parse(text);
          errorMsg = json.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await r.json();
      console.log('Received events:', data.items);
      const googleEvents = data.items ?? [];
      setEvents(googleEvents);
      if (onEventsLoaded) {
        onEventsLoaded(googleEvents);
      }
    } catch (e: any) {
      setError(e.message ?? "Failed to load events");
      console.error('Error loading events:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Auto-load if linked=1 is in the URL (came back from callback)
    const params = new URLSearchParams(window.location.search);
    if (params.get("linked") === "1") {
      loadEvents();
      setIsExpanded(true);
    }
  }, []);

  async function connectGoogle() {
    const token = auth?.user?.access_token;
    const r = await fetch(`${API_BASE}/api/auth/google/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    });

    if (!r.ok) {
      const text = await r.text();
      alert("Failed to start Google link: " + text);
      return;
    }

    const { url } = await r.json();
    window.location.href = url;
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
    } catch (e: any) {
      setError(e.message ?? "Failed to sync events");
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
    } catch (e: any) {
      setError(e.message ?? "Failed to import event");
      console.error('Error importing event:', e);
      setImportingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  }

  return (
    <div className="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-itin-sand-900">
          🔗 Google Calendar Sync
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-itin-sand-600 hover:text-itin-sand-900"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={connectGoogle}
            >
              🔐 Connect Google Calendar
            </button>

            <button
              className="px-4 py-2 rounded-xl bg-itin-sand-700 text-white hover:opacity-90 transition-opacity"
              onClick={loadEvents}
              disabled={loading}
            >
              🔄 Refresh Events
            </button>

            {events.length > 0 && (
              <button
                className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                onClick={syncAllEvents}
                disabled={syncing || loading}
              >
                {syncing ? '⏳ Importing...' : '📥 Import All to Calendar'}
              </button>
            )}
          </div>

          {syncResult && (
            <div className="p-4 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ✅ Successfully imported {syncResult.imported} of {syncResult.total} events
              {syncResult.skipped > 0 && ` (${syncResult.skipped} skipped)`}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-itin-sand-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-itin-sand-600"></div>
              <p>Loading events from Google Calendar...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <p className="text-itin-sand-600">
              No upcoming Google Calendar events found. Click "Connect Google Calendar" to link your account.
            </p>
          )}

          {!loading && !error && events.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-itin-sand-900 mb-3">
                Upcoming Google Calendar Events ({events.length})
              </h3>
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {events.map(ev => {
                  const isImporting = importingEvents.has(ev.id);
                  return (
                    <li 
                      key={ev.id} 
                      className="p-4 bg-white border border-itin-sand-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-itin-sand-900">
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
                                className="underline text-blue-600 hover:text-blue-800" 
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
                          className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap"
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

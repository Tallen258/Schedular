import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type EventItem = {
  id: string;
  summary: string;
  start: string | null;
  end: string | null;
  location: string | null;
  attendees: { email: string; responseStatus?: string }[];
  hangoutLink: string | null;
};

const Calendar = () => {
  const auth = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setEvents(data.items ?? []);
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

  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-5xl card p-6">
        <header>
          <div className="itin-header">Calendar</div>
          <div className="accent-bar mt-2" />
        </header>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-xl bg-itin-sand-700 text-white hover:opacity-90"
              onClick={connectGoogle}
            >
              Connect Google Calendar
            </button>

            <button
              className="px-4 py-2 rounded-xl bg-itin-sand-700 text-white hover:opacity-90"
              onClick={loadEvents}
            >
              Refresh Events
            </button>
          </div>

          {loading && (
            <p className="text-itin-sand-600">Loading events...</p>
          )}

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              Error: {error}
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <p className="text-itin-sand-600">No upcoming events found. Click "Connect Google Calendar" to link your account.</p>
          )}

          {!loading && !error && events.length > 0 && (
            <ul className="space-y-3">
              {events.map(ev => (
                <li key={ev.id} className="p-4 bg-white border border-itin-sand-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-itin-sand-900">
                    {ev.summary}
                  </h3>
                  <div className="flex gap-4 mt-2 text-sm text-itin-sand-700">
                    <span>📅 {formatDate(ev.start)} → {formatDate(ev.end)}</span>
                  </div>
                  {ev.location && (
                    <div className="text-sm mt-1">📍 {ev.location}</div>
                  )}
                  {ev.hangoutLink && (
                    <div className="text-sm mt-1">
                      Meet: <a className="underline text-blue-600" href={ev.hangoutLink} target="_blank" rel="noopener noreferrer">Join link</a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
};

export default Calendar;

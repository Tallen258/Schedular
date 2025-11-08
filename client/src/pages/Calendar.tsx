import { useNavigate } from "react-router-dom";
import { useEvents } from "../hooks/useEvents";
import MyCalendar, { type RbcEvent } from "../components/myCalendar";
import SyncGoogleCalendar from "../components/SyncGoogleCalendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const Calendar = () => {
  const navigate = useNavigate();
  const { data: events, isLoading, error } = useEvents();

  // Convert API events to react-big-calendar format
  const calendarEvents: RbcEvent[] = (events || []).map(event => ({
    id: event.id.toString(),
    title: event.title,
    start: new Date(event.start_time),
    end: new Date(event.end_time),
    allDay: event.all_day,
    resource: event, // Store full event data for later use
  }));

  const handleSelectEvent = (event: RbcEvent) => {
    // Navigate to event detail page when clicking on an event
    navigate(`/event/${event.id}`);
  };

  const handleSelectSlot = (slot: { start: Date; end: Date }) => {
    // Navigate to create event page with pre-filled times
    const startTime = slot.start.toISOString().slice(0, 16);
    const endTime = slot.end.toISOString().slice(0, 16);
    navigate(`/create-event?start=${startTime}&end=${endTime}`);
  };

  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-7xl">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="itin-header">Calendar</div>
              <div className="accent-bar mt-2" />
            </div>
            <button
              onClick={() => navigate('/create-event')}
              className="btn-primary"
            >
              + Create Event
            </button>
          </div>
        </header>

        {/* Google Calendar Sync Section */}
        <SyncGoogleCalendar />

        {isLoading && (
          <div className="card p-6">
            <p className="text-itin-sand-600">Loading events...</p>
          </div>
        )}

        {error && (
          <div className="card p-6">
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              Error: {error.message}
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <MyCalendar
            events={calendarEvents}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        )}
      </section>
    </main>
  );
};

export default Calendar;

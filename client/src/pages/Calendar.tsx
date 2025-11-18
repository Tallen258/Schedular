import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Views, type View } from "react-big-calendar";
import { useEvents } from "../hooks/useEvents";
import MyCalendar, { type RbcEvent } from "../components/myCalendar";
import SyncGoogleCalendar from "../components/SyncGoogleCalendar";

const Calendar = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<View>(Views.MONTH);
  const { data: events, isLoading, error } = useEvents();

  const calendarEvents: RbcEvent[] = (events || []).map(event => ({
    id: event.id.toString(),
    title: event.title,
    start: new Date(event.start_time),
    end: new Date(event.end_time),
    allDay: event.all_day,
    resource: event, 
  }));

  const handleSelectEvent = (event: RbcEvent) => {
    navigate(`/event/${event.id}`);
  };

  const handleSelectSlot = (slot: { start: Date; end: Date }) => {
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
            date={date}
            view={view}
            onNavigate={setDate}
            onView={setView}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        )}
      </section>
    </main>
  );
};

export default Calendar;

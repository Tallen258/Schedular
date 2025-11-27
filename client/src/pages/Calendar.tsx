import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Views, type View } from "react-big-calendar";
import { useEvents } from "../hooks/useEvents";
import { getUserSettings } from "../utils/localStorage";
import MyCalendar, { type RbcEvent } from "../components/myCalendar";
import SyncGoogleCalendar from "../components/SyncGoogleCalendar";
import Spinner from "../components/Spinner";

const Calendar = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<View>(Views.MONTH);
  const { data: events, isLoading, error } = useEvents();
  const settings = getUserSettings();

  console.log('[Calendar] Events data:', events);
  console.log('[Calendar] Is loading:', isLoading);
  console.log('[Calendar] Error:', error);

  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${period}`;
  };

  const calendarEvents: RbcEvent[] = (events || []).map(event => ({
    id: event.id.toString(),
    title: event.title,
    start: new Date(event.start_time),
    end: new Date(event.end_time),
    allDay: event.all_day,
    resource: event, 
  }));

  console.log('[Calendar] Calendar events:', calendarEvents);

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
          <div className="mt-4 p-3 bg-accent-green-50 border border-accent-green-200 rounded-lg">
            <p className="text-sm text-accent-green-800">
              <span className="font-semibold">Available Hours:</span> {formatTime12Hour(settings.workStartTime)} - {formatTime12Hour(settings.workEndTime)}
            </p>
          </div>
        </header>

        {/* Google Calendar Sync Section */}
        <SyncGoogleCalendar />

        {isLoading && (
          <div className="card p-6 flex justify-center">
            <Spinner />
          </div>
        )}

        {error && (
          <div className="card p-6">
            <div className="p-4 bg-custom-red-50 border border-custom-red-500 text-custom-red-700 rounded-lg">
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
            workStartTime={settings.workStartTime}
            workEndTime={settings.workEndTime}
          />
        )}
      </section>
    </main>
  );
};

export default Calendar;

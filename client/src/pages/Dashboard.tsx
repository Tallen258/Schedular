import { useNavigate } from 'react-router-dom';
import { useUpcomingEvents } from '../hooks/useEvents';
import Spinner from '../components/Spinner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: upcomingEvents, isLoading, error } = useUpcomingEvents(5);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-4xl card p-6">
        <header>
          <div className="itin-header">Dashboard</div>
          <div className="accent-bar mt-2" />
        </header>

        <div className="mt-6 grid gap-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
              <button
                onClick={() => navigate('/create-event')}
                className="btn-primary text-sm"
              >
                + Create Event
              </button>
            </div>

            {isLoading && (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            )}

            {error && (
              <div className="text-custom-red-700">
                Failed to load events: {error.message}
              </div>
            )}

            {!isLoading && !error && upcomingEvents && upcomingEvents.length === 0 && (
              <div className="text-itin-sand-700">
                No upcoming events — create one to get started!
              </div>
            )}

            {!isLoading && !error && upcomingEvents && upcomingEvents.length > 0 && (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border border-itin-sand-200 rounded-lg p-4 hover:border-itin-sand-400 transition-colors cursor-pointer"
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <div className="text-sm text-itin-sand-600 mt-1">
                          {formatDateTime(event.start_time)}
                        </div>
                        {event.location && (
                          <div className="text-sm text-itin-sand-600 mt-1">
                            📍 {event.location}
                          </div>
                        )}
                        {event.description && (
                          <div className="text-sm text-itin-sand-700 mt-2">
                            {event.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="text-itin-sand-700">
              View your calendar or compare schedules to find available time slots.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
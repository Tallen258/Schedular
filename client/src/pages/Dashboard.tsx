const Dashboard = () => {
  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-4xl card p-6">
        <header>
          <div className="itin-header">Dashboard</div>
          <div className="accent-bar mt-2" />
        </header>

        <div className="mt-6 grid gap-6">
          <div>
            <h2>Upcoming Events</h2>
            <div className="mt-2 text-itin-sand-700">No upcoming events — add one using Create Event.</div>
          </div>

          <div>
            <h2>Available Time Slots</h2>
            <div className="mt-2 text-itin-sand-700">No free slots detected.</div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
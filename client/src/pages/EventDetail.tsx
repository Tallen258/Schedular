import React from 'react';

const EventDetail = () => {
  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-3xl card p-6">
        <header>
          <div className="itin-header">Event Details</div>
          <div className="accent-bar mt-2" />
        </header>

        <div className="mt-6">
          <div className="mb-4">
            <h2>Title</h2>
            <div className="text-itin-sand-700">Project planning meeting</div>
          </div>

          <div className="mb-4">
            <h2>When</h2>
            <div className="text-itin-sand-700">Nov 10, 2025 — 10:00–11:00</div>
          </div>

          <div className="mb-4">
            <h2>Potential Conflicts</h2>
            <div className="text-itin-sand-700">No conflicts detected.</div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EventDetail;
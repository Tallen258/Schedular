import React from 'react';

const Help: React.FC = () => {
  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-4xl card p-6">
        <header>
          <div className="itin-header">Help</div>
          <div className="accent-bar mt-2" />
        </header>

        <div className="mt-6">
          <section>
            <h2>Getting Started</h2>
            <p className="text-itin-sand-700">Sign in, allow calendar access, and add events from the Create Event page.</p>
          </section>

          <section className="mt-4">
            <h2>Features</h2>
            <p className="text-itin-sand-700">Dashboard, Calendar, Compare Schedules, Image Review, Defaults and AI assistant.</p>
          </section>

          <section className="mt-4">
            <h2>FAQs</h2>
            <p className="text-itin-sand-700">Common questions and troubleshooting tips will appear here.</p>
          </section>
        </div>
      </section>
    </main>
  );
};

export default Help;
import React from 'react';

const Calendar: React.FC = () => {
  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-5xl card p-6">
        <header>
          <div className="itin-header">Calendar</div>
          <div className="accent-bar mt-2" />
        </header>

        <div className="mt-6">
          <p className="text-itin-sand-700">Interactive calendar will render here (month / week / day views).</p>
        </div>
      </section>
    </main>
  );
};

export default Calendar;
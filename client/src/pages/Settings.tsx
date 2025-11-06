import React from 'react';

const Settings = () => {
  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-3xl card p-6">
        <header>
          <div className="itin-header">Default Settings</div>
          <div className="accent-bar mt-2" />
        </header>

        <form className="mt-6 space-y-4">
          <div>
            <h2>Work / School Hours</h2>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <input className="form-input" placeholder="Start (e.g. 09:00)" />
              <input className="form-input" placeholder="End (e.g. 17:00)" />
            </div>
          </div>

          <div>
            <h2>Preferences</h2>
            <div className="mt-2 text-itin-sand-700">Set default event length, buffer times, and preferred days.</div>
          </div>

          <div className="mt-4">
            <button className="btn-primary">Save defaults</button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Settings;
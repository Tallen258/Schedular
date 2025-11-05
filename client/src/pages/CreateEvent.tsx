import React from 'react';

const CreateEvent: React.FC = () => {
  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-2xl card p-6">
        <header>
          <div className="itin-header">Create Event</div>
          <div className="accent-bar mt-2" />
        </header>

        <form className="mt-6 space-y-4">
          <div>
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="Meeting with team" />
          </div>

          <div>
            <label className="form-label">Date & Time</label>
            <input className="form-input" placeholder="2025-11-04 10:00" />
          </div>

          <div>
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={4} placeholder="Optional notes" />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" className="btn-secondary">Cancel</button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default CreateEvent;
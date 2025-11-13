import ScheduleCompare from "./ScheduleCompare";

const CompareSchedule = () => {
  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-3xl card p-6">
        <header>
          <div className="itin-header">Compare Schedules</div>
          <div className="accent-bar mt-2" />
        </header>

        <div className="mt-6">
          <p className="text-itin-sand-700">Upload a photo of another user's schedule to compare availability.</p>

          <div className="mt-4">
            <input type="file" accept="image/*" className="form-input" />
          </div>

          <div className="mt-4">
            <button className="btn-primary">Upload & Analyze</button>
            <button className="btn-secondary ml-3">Clear</button>
          </div>
          <ScheduleCompare />
        </div>
      </section>
    </main>
  );
};

export default CompareSchedule;
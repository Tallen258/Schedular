import { useState, useEffect } from 'react';
import { getUserSettings, saveUserSettings, type UserSettings } from '../utils/localStorage';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loaded = getUserSettings();
    setSettings(loaded);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      saveUserSettings(settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDay = (day: number) => {
    setSettings(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day].sort(),
    }));
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-3xl card p-6">
        <header>
          <div className="itin-header">Default Settings</div>
          <div className="accent-bar mt-2" />
        </header>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-itin-sand-900 mb-3">Work / School Hours</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-itin-sand-700 mb-1">Start Time</label>
                <input
                  type="time"
                  className="form-input w-full"
                  value={settings.workStartTime}
                  onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-itin-sand-700 mb-1">End Time</label>
                <input
                  type="time"
                  className="form-input w-full"
                  value={settings.workEndTime}
                  onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-itin-sand-900 mb-3">Event Preferences</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-itin-sand-700 mb-1">
                  Default Event Duration (minutes)
                </label>
                <input
                  type="number"
                  className="form-input w-full"
                  min="15"
                  step="15"
                  value={settings.defaultEventDuration}
                  onChange={(e) => setSettings({ ...settings, defaultEventDuration: parseInt(e.target.value) || 60 })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-itin-sand-700 mb-1">
                  Buffer Time Between Events (minutes)
                </label>
                <input
                  type="number"
                  className="form-input w-full"
                  min="0"
                  step="5"
                  value={settings.bufferTime}
                  onChange={(e) => setSettings({ ...settings, bufferTime: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-itin-sand-900 mb-3">Preferred Days</h2>
            <p className="text-sm text-itin-sand-700 mb-3">
              Select days when you're available for scheduling
            </p>
            <div className="flex flex-wrap gap-2">
              {dayNames.map((name, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleToggleDay(index)}
                  className={`px-4 py-2 rounded border transition-colors ${
                    settings.preferredDays.includes(index)
                      ? 'bg-accent-green-600 text-white border-accent-green-600'
                      : 'bg-white text-itin-sand-700 border-itin-sand-200 hover:border-accent-green-400'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-itin-sand-200">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Settings;
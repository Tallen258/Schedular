import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '../hooks/useEvents';

const CreateEvent = () => {
  console.log('CreateEvent component rendering');
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    all_day: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.start_time || !formData.end_time) {
      return;
    }

    try {
      await createEventMutation.mutateAsync({
        title: formData.title,
        description: formData.description || undefined,
        location: formData.location || undefined,
        start_time: formData.start_time,
        end_time: formData.end_time,
        all_day: formData.all_day,
      });

      // Navigate to calendar on success
      navigate('/calendar');
    } catch (error) {
      // Error is handled by the mutation hook with toast
      console.error('Failed to create event:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-2xl card p-6">
        <header>
          <div className="itin-header">Create Event</div>
          <div className="accent-bar mt-2" />
        </header>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="form-label">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              className="form-input"
              placeholder="Team Meeting"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                name="start_time"
                type="datetime-local"
                className="form-input"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="form-label">
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                name="end_time"
                type="datetime-local"
                className="form-input"
                value={formData.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Location</label>
            <input
              name="location"
              className="form-input"
              placeholder="Conference Room A"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-input"
              rows={4}
              placeholder="Optional notes about the event"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              name="all_day"
              type="checkbox"
              id="all_day"
              checked={formData.all_day}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label htmlFor="all_day" className="form-label !mb-0">
              All Day Event
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary"
              disabled={createEventMutation.isPending}
            >
              {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/calendar')}
              disabled={createEventMutation.isPending}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default CreateEvent;
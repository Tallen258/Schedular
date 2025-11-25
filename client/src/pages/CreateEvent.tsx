import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '../hooks/useEvents';
import TextInput from '../components/forms/TextInput';
import TextArea from '../components/forms/TextArea';
import DateTimeInput from '../components/forms/DateTimeInput';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/layout/Card';
import PageHeader from '../components/layout/PageHeader';
import Grid from '../components/layout/Grid';
import { useAgenticAction } from '../contexts/AgenticActionContext';

const CreateEvent = () => {
  console.log('CreateEvent component rendering');
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();
  const { recordAction } = useAgenticAction();

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

    if (!formData.title || !formData.start_time || !formData.end_time) {
      return;
    }

    try {
      const startISO = new Date(formData.start_time).toISOString();
      const endISO = new Date(formData.end_time).toISOString();
      
      await createEventMutation.mutateAsync({
        title: formData.title,
        description: formData.description || undefined,
        location: formData.location || undefined,
        start_time: startISO,
        end_time: endISO,
        all_day: formData.all_day,
      });

      // Trigger automatic UI updates: notification panel slides out + navigation
      recordAction('event_created', {
        actionName: 'Event Created',
        message: `"${formData.title}" has been added to your calendar`,
        type: 'success',
        eventTitle: formData.title
      });
    } catch (error) {
      console.error('Failed to create event:', error);
      recordAction('error', {
        actionName: 'Creation Failed',
        message: 'Unable to create event. Please try again.',
        type: 'error',
        retryCount: 1
      });
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
    <PageContainer maxWidth="sm">
      <Card>
        <PageHeader title="Create Event" />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <TextInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Team Meeting"
            required
          />

          <Grid cols={2} gap="md">
            <DateTimeInput
              label="Start Date & Time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              type="datetime-local"
              required
            />

            <DateTimeInput
              label="End Date & Time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              type="datetime-local"
              required
            />
          </Grid>

          <TextInput
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Conference Room A"
          />

          <TextArea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Optional notes about the event"
          />

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
      </Card>
    </PageContainer>
  );
};

export default CreateEvent;
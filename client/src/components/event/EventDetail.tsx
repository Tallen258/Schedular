import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useUpdateEvent, useDeleteEvent } from '../../hooks/useEvents';
import { useAgenticAction } from '../../context/AgenticActionContext';
import EventForm from './EventForm';
import Spinner from '../Spinner';

const formatForInput = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = id ? Number(id) : 0;
  const { recordAction } = useAgenticAction();

  const { data: event, isLoading, error } = useEvent(eventId);
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', start_time: '', end_time: '' });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        start_time: formatForInput(new Date(event.start_time)),
        end_time: formatForInput(new Date(event.end_time)),
      });
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEventMutation.mutateAsync({
        id: eventId,
        input: {
          title: formData.title,
          description: formData.description || undefined,
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString(),
        },
      });
      setIsEditing(false);
      recordAction('event_updated', {
        actionName: 'Event Updated',
        message: `"${formData.title}" has been successfully updated`,
        type: 'success',
        eventTitle: formData.title
      });
    } catch (error) {
      console.error('Failed to update event:', error);
      recordAction('error', {
        actionName: 'Update Failed',
        message: 'Unable to update event. Please try again.',
        type: 'error',
        retryCount: 1
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const eventTitle = event?.title || 'Event';
      await deleteEventMutation.mutateAsync(eventId);
      recordAction('event_deleted', {
        actionName: 'Event Deleted',
        message: `"${eventTitle}" has been removed from your calendar`,
        type: 'success',
        eventTitle
      });
    } catch (error) {
      console.error('Failed to delete event:', error);
      recordAction('error', {
        actionName: 'Delete Failed',
        message: 'Unable to delete event. Please try again.',
        type: 'error',
        retryCount: 1
      });
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen p-6 bg-itin-sand-50">
        <section className="mx-auto max-w-2xl card p-6 flex justify-center"><Spinner /></section>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen p-6 bg-itin-sand-50">
        <section className="mx-auto max-w-2xl card p-6">
          <div className="text-custom-red-700">Failed to load event: {error?.message || 'Event not found'}</div>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">Back to Dashboard</button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-itin-sand-50">
      <section className="mx-auto max-w-2xl card p-6">
        <header className="flex justify-between items-start mb-6">
          <div>
            <div className="itin-header">Event Details</div>
            <div className="accent-bar mt-2" />
          </div>
          <button onClick={() => navigate('/calendar')} className="btn-secondary">← Calendar</button>
        </header>

        {!isEditing ? (
          <div className="flex flex-col gap-4">
            <div><h2 className="text-2xl font-bold">{event.title}</h2></div>

            <div>
              <div className="form-label">Start</div>
              <div className="text-itin-sand-700">{formatDateTime(event.start_time)}</div>
            </div>

            <div>
              <div className="form-label">End</div>
              <div className="text-itin-sand-700">{formatDateTime(event.end_time)}</div>
            </div>

            {event.location && (
              <div>
                <div className="form-label">Location</div>
                <div className="text-itin-sand-700">📍 {event.location}</div>
              </div>
            )}

            {event.description && (
              <div>
                <div className="form-label">Description</div>
                <div className="text-itin-sand-700 whitespace-pre-wrap">{event.description}</div>
              </div>
            )}

            {event.all_day && (
              <div className="inline-block bg-itin-sand-100 text-itin-sand-700 px-3 py-1 rounded-full text-sm">
                All Day Event
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-itin-sand-200">
              <button onClick={() => setIsEditing(true)} className="btn-primary">Edit Event</button>
              <button
                onClick={handleDelete}
                className="btn-secondary bg-custom-red-50 text-custom-red-700 hover:bg-custom-red-500 hover:text-white"
                disabled={deleteEventMutation.isPending}
              >
                {deleteEventMutation.isPending ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        ) : (
          <EventForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            submitLabel="Save Changes"
            isSubmitting={updateEventMutation.isPending}
          />
        )}
      </section>
    </main>
  );
};

export default EventDetail;
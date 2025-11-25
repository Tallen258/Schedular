import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '../hooks/useEvents';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/layout/Card';
import PageHeader from '../components/layout/PageHeader';
import EventForm from '../components/EventForm';
import { useAgenticAction } from '../contexts/AgenticActionContext';

const CreateEvent = () => {
  console.log('CreateEvent component rendering');
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();
  const { recordAction } = useAgenticAction();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
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
        start_time: startISO,
        end_time: endISO,
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
        <EventForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/calendar')}
          submitLabel="Create Event"
          isSubmitting={createEventMutation.isPending}
        />
      </Card>
    </PageContainer>
  );
};

export default CreateEvent;
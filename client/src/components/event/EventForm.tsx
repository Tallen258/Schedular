import TextInput from '../forms/TextInput';
import TextArea from '../forms/TextArea';
import DateTimeInput from '../forms/DateTimeInput';

interface EventFormData {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
}

interface EventFormProps {
  formData: EventFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting: boolean;
  cancelLabel?: string;
}

const EventForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
  cancelLabel = 'Cancel'
}: EventFormProps) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-6">
      <TextInput
        label="Title"
        name="title"
        value={formData.title}
        onChange={onChange}
        placeholder="Team Meeting"
        required
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <DateTimeInput
            label="Start Date & Time"
            name="start_time"
            value={formData.start_time}
            onChange={onChange}
            type="datetime-local"
            required
          />
        </div>

        <div className="flex-1">
          <DateTimeInput
            label="End Date & Time"
            name="end_time"
            value={formData.end_time}
            onChange={onChange}
            type="datetime-local"
            required
          />
        </div>
      </div>

      <TextArea
        label="Description"
        name="description"
        value={formData.description}
        onChange={onChange}
        rows={4}
        placeholder="Optional notes about the event"
      />

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </button>
      </div>
    </form>
  );
};

export default EventForm;

import ChatMessages from '../chat/ChatMessages';
import ChatInput from '../chat/ChatInput';
import { useChatConversation } from '../../hooks/useChatConversation';

interface EventCreationChatProps {
  onBack: () => void;
}

const EventCreationChat = ({ onBack }: EventCreationChatProps) => {
  const {
    conversationId,
    messages,
    input,
    setInput,
    imagePreview,
    error,
    loading,
    handleImageSelect,
    clearImage,
    sendMessage,
  } = useChatConversation({
    conversationTitle: 'Create Event Helper',
    autoCreate: true,
    persistKey: 'event_creation', // Enable persistence with unique key
  });

  return (
    <div className="flex flex-col h-[600px]">
      <ChatMessages
        messages={messages}
        loading={loading}
        error={error}
      />

      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={sendMessage}
        imagePreview={imagePreview}
        onImageSelect={handleImageSelect}
        onClearImage={clearImage}
        disabled={loading || !conversationId}
        placeholder="Describe the event you want to create..."
        inputId="event-image-upload"
      />
      
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={onBack}
        >
          Back to Calendar
        </button>
      </div>
    </div>
  );
};

export default EventCreationChat;

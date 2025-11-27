import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import Spinner from '../Spinner';
import type { ChatMessage as ChatMessageType } from '../../api/chat';

interface ChatMessagesProps {
  messages: ChatMessageType[];
  loading: boolean;
  error: string | null;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateExample?: string;
}

const ChatMessages = ({
  messages,
  loading,
  error,
  emptyStateTitle = "👋 Hi! I'm your assistant.",
  emptyStateDescription = "How can I help you today?",
  emptyStateExample
}: ChatMessagesProps) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4 bg-itin-sand-50 rounded-lg">
      {messages.length === 0 && !loading && (
        <div className="text-center text-itin-sand-600 mt-8">
          <p className="text-lg mb-2">{emptyStateTitle}</p>
          <p className="text-sm">{emptyStateDescription}</p>
          {emptyStateExample && (
            <p className="text-xs text-itin-sand-500 mt-2">{emptyStateExample}</p>
          )}
        </div>
      )}
      
      {messages.map((m) => (
        <ChatMessage
          key={m.id}
          role={m.role}
          content={m.content}
          imageUrl={m.imageUrl}
        />
      ))}
      
      {loading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-xl px-4 py-3 shadow bg-custom-white text-itin-sand-800 border border-itin-sand-200 flex items-center gap-3">
            <Spinner />
            <span className="text-sm text-itin-sand-600">Thinking...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="text-center text-custom-red-700 text-sm bg-custom-red-50 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <div ref={endRef} />
    </div>
  );
};

export default ChatMessages;

import { useEffect, useRef } from 'react';
import Markdown from '../Markdown';
import Spinner from '../Spinner';
import type { ChatMessage } from '../../api/chat';

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}

const ChatMessages = ({ messages, loading, error }: ChatMessagesProps) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
      {messages.length === 0 && !loading && (
        <div className="text-center text-itin-sand-600 mt-8">
          <p className="text-lg mb-2"> Hi! I'm your scheduling assistant.</p>
          <p className="text-sm">Ask me about your schedule, events, or request to create new events.</p>
        </div>
      )}
      
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-xl px-4 py-3 shadow ${
              m.role === "user"
                ? "bg-itin-sand-600 text-itin-sand-10"
                : "bg-custom-white text-itin-sand-800 border border-itin-sand-200"
            }`}
          >
            {m.imageUrl && (
              <div className="mb-2">
                <img 
                  src={m.imageUrl} 
                  alt="Uploaded" 
                  className="max-w-full h-auto rounded-lg max-h-64 object-contain"
                />
              </div>
            )}
            {m.role === "assistant" ? (
              <Markdown content={m.content} />
            ) : (
              <div className="whitespace-pre-wrap">{m.content}</div>
            )}
          </div>
        </div>
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

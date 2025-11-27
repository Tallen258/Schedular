import Markdown from '../Markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

const ChatMessage = ({ role, content, imageUrl }: ChatMessageProps) => {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 shadow ${
          role === "user"
            ? "bg-itin-sand-600 text-itin-sand-10"
            : "bg-custom-white text-itin-sand-800 border border-itin-sand-200"
        }`}
      >
        {imageUrl && (
          <div className="mb-2">
            <img 
              src={imageUrl} 
              alt="Uploaded" 
              className="max-w-full h-auto rounded-lg max-h-64 object-contain"
            />
          </div>
        )}
        {role === "assistant" ? (
          <Markdown content={content} />
        ) : (
          <div className="whitespace-pre-wrap">{content}</div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

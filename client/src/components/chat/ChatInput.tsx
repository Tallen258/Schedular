import { useRef } from 'react';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  imagePreview: string | null;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  disabled: boolean;
  placeholder?: string;
  inputId?: string;
}

const ChatInput = ({
  input,
  onInputChange,
  onSubmit,
  imagePreview,
  onImageSelect,
  onClearImage,
  disabled,
  placeholder = "Type your message...",
  inputId = "chat-image-upload"
}: ChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-itin-sand-200 bg-custom-white rounded-b-lg">
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="max-h-32 rounded-lg border-2 border-itin-sand-300"
          />
          <button
            type="button"
            onClick={onClearImage}
            className="absolute -top-2 -right-2 bg-custom-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-custom-red-700 transition-colors"
            title="Remove image"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageSelect}
          className="hidden"
          id={inputId}
        />
        <label
          htmlFor={inputId}
          className={`btn-secondary px-4 py-2 cursor-pointer flex items-center justify-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Upload image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </label>
        <textarea
          className="form-input resize-none flex-1"
          placeholder={placeholder}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
          rows={3}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className={disabled || !input.trim() ? "btn-primary opacity-50 cursor-not-allowed" : "btn-primary"}
        >
          {disabled ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;

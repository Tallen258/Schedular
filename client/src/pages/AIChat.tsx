import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Markdown from "../components/Markdown";
import ChatSidebar from "../components/ChatSidebar";
import Spinner from "../components/Spinner";
import {
  useConversations,
  useMessages,
  useCreateConversation,
  usePostMessage,
  useDeleteConversation,
} from "../hooks/useAIChat";
import type { ChatMessage } from "../api/chat";

const AIChat = () => {
  const nav = useNavigate();
  const { conversationId: paramId } = useParams<{ conversationId: string }>();
  const activeId = paramId ? Number(paramId) : null;

  // Load conversations
  const conversationsQuery = useConversations();
  const conversations = conversationsQuery.data ?? [];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createConversationMutation = useCreateConversation();
  const postMessageMutation = usePostMessage();
  const deleteConversationMutation = useDeleteConversation();

  const goToConversation = useCallback((id: number) => {
    nav(`/chat/${id}`);
  }, [nav]);

  const createConversationAndGo = useCallback(async () => {
    try {
      const convo = await createConversationMutation.mutateAsync();
      nav(`/chat/${convo.id}`);
    } catch (e: unknown) {
      const error = e as Error;
      setError(error?.message ?? "Failed to create conversation");
    }
  }, [createConversationMutation, nav]);

  const handleDeleteConversation = useCallback(async (id: number) => {
    try {
      await deleteConversationMutation.mutateAsync(id);
      
      // If we're deleting the active conversation, navigate to first available or create new
      if (activeId === id) {
        const remainingConvos = conversations.filter(c => c.id !== id);
        if (remainingConvos.length > 0) {
          nav(`/chat/${remainingConvos[0].id}`);
        } else {
          // Create a new conversation if none left
          const newConvo = await createConversationMutation.mutateAsync();
          nav(`/chat/${newConvo.id}`);
        }
      }
    } catch (e: unknown) {
      const error = e as Error;
      setError(error?.message ?? "Failed to delete conversation");
    }
  }, [activeId, conversations, deleteConversationMutation, createConversationMutation, nav]);

  useEffect(() => {
    if (conversationsQuery.isLoading) return;
    if (activeId && Number.isFinite(activeId)) return;

    if (conversations.length > 0) {
      goToConversation(conversations[0].id);
    } else {
      void createConversationAndGo();
    }
  }, [conversationsQuery.isLoading, conversations, activeId, goToConversation, createConversationAndGo]);

  // Messages
  const messagesQuery = useMessages(activeId);

  useEffect(() => {
    if (messagesQuery.data) setMessages(messagesQuery.data);
    if (messagesQuery.error) {
      const e = messagesQuery.error as Error;
      if (String(e?.message) === "not-found") {
        void createConversationAndGo();
        return;
      }
      setError(e?.message ?? "Failed to load messages");
    }
  }, [messagesQuery.data, messagesQuery.error, createConversationAndGo]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function clearImage() {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId) return;
    const content = input.trim();
    if (!content) return;

    setInput("");
    setError(null);

    const optimistic: ChatMessage = {
      id: -Date.now(),
      conversationId: activeId,
      role: "user",
      content,
      imageUrl: imagePreview || undefined,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);

    const imageToSend = selectedImage;
    clearImage();

    try {
      const data = await postMessageMutation.mutateAsync({
        conversationId: activeId,
        content,
        imageFile: imageToSend || undefined,
      });
      setMessages((m) => [
        ...m.filter((x) => x.id !== optimistic.id),
        data.userMessage,
        data.assistantMessage,
      ]);
    } catch (e: unknown) {
      const error = e as Error;
      setError(error?.message ?? "Send failed");
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      setInput(content);
      if (imageToSend) {
        setSelectedImage(imageToSend);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(imageToSend);
      }
    }
  }

  const loading = postMessageMutation.isPending;

  return (
    <div className="min-h-screen flex bg-itin-sand-50">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId ?? null}
        onNew={createConversationAndGo}
        onSelect={goToConversation}
        onDelete={handleDeleteConversation}
      />

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-itin-sand-200 bg-custom-white flex items-center justify-between">
          <span className="text-lg font-semibold text-itin-sand-800">
            {conversations.find((c) => c.id === activeId)?.title ?? "AI Assistant"}
          </span>
        </div>

        <div className="p-4 flex-1 overflow-auto space-y-4">
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

        <form
          onSubmit={onSend}
          className="p-4 border-t border-itin-sand-200 bg-custom-white"
        >
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-32 rounded-lg border-2 border-itin-sand-300"
              />
              <button
                type="button"
                onClick={clearImage}
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
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`btn-secondary px-4 py-2 cursor-pointer flex items-center justify-center ${loading || !activeId ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Upload image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </label>
            <textarea
              className="form-input resize-none"
              placeholder="Ask about your schedule or request an event..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend(e);
                }
              }}
              rows={3}
              disabled={loading || !activeId}
            />
            <button
              type="submit"
              disabled={loading || !input.trim() || !activeId}
              className={loading || !input.trim() || !activeId ? "btn-primary opacity-50 cursor-not-allowed" : "btn-primary"}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
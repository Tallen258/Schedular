import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Markdown from "../components/Markdown";
import ChatSidebar from "../components/ChatSidebar";
import {
  useConversations,
  useMessages,
  useCreateConversation,
  usePostMessage,
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
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const createConversationMutation = useCreateConversation();
  const postMessageMutation = usePostMessage();

  function goToConversation(id: number) {
    nav(`/chat/${id}`);
  }

  async function createConversationAndGo() {
    try {
      const convo = await createConversationMutation.mutateAsync();
      nav(`/chat/${convo.id}`);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create conversation");
    }
  }

  // If no :conversationId, pick first or create one
  useEffect(() => {
    if (conversationsQuery.isLoading) return;
    if (activeId && Number.isFinite(activeId)) return;

    if (conversations.length > 0) {
      goToConversation(conversations[0].id);
    } else {
      createConversationAndGo();
    }
  }, [conversationsQuery.isLoading, conversations.length, activeId]);

  // Messages
  const messagesQuery = useMessages(activeId);

  useEffect(() => {
    if (messagesQuery.data) setMessages(messagesQuery.data);
    if (messagesQuery.error) {
      const e: any = messagesQuery.error;
      if (String(e?.message) === "not-found") {
        createConversationAndGo();
        return;
      }
      setError(e?.message ?? "Failed to load messages");
    }
  }, [messagesQuery.data, messagesQuery.error]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);

    try {
      const data = await postMessageMutation.mutateAsync({
        conversationId: activeId,
        content,
      });
      setMessages((m) => [
        ...m.filter((x) => x.id !== optimistic.id),
        data.userMessage,
        data.assistantMessage,
      ]);
    } catch (e: any) {
      setError(e?.message ?? "Send failed");
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      setInput(content);
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
      />

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-itin-sand-200 bg-custom-white flex items-center justify-between">
          <span className="text-lg font-semibold text-itin-sand-800">
            {conversations.find((c) => c.id === activeId)?.title ?? "AI Assistant"}
          </span>
          {loading && (
            <span className="text-sm text-itin-sand-500">Thinking...</span>
          )}
        </div>

        <div className="p-4 flex-1 overflow-auto space-y-4">
          {messages.length === 0 && !loading && (
            <div className="text-center text-itin-sand-600 mt-8">
              <p className="text-lg mb-2">👋 Hi! I'm your scheduling assistant.</p>
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
                {m.role === "assistant" ? (
                  <Markdown content={m.content} />
                ) : (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                )}
              </div>
            </div>
          ))}
          
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
          <div className="flex gap-2">
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
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInputForm from "../components/chat/ChatInputForm";
import { useMessages, usePostMessage } from "../hooks/useAIChat";
import { useConversationManagement } from "../hooks/useConversationManagement";
import { useChatInput } from "../hooks/useChatInput";
import type { ChatMessage } from "../api/chat";
import "../assets/styles/aiChatResponsive.css";

const AIChat = () => {
  const { conversationId: paramId } = useParams<{ conversationId: string }>();
  const activeId = paramId ? Number(paramId) : null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const postMessageMutation = usePostMessage();
  const messagesQuery = useMessages(activeId);

  const {
    conversations,
    goToConversation,
    createConversationAndGo,
    handleDeleteConversation,
  } = useConversationManagement(activeId);

  const {
    input,
    setInput,
    selectedImage,
    imagePreview,
    fileInputRef,
    handleImageSelect,
    clearImage,
    resetInput,
    restoreInput,
  } = useChatInput();

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

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId) return;
    const content = input.trim();
    if (!content) return;

    const imageToSend = selectedImage;
    resetInput();
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
      restoreInput(content, imageToSend || undefined);
    }
  }

  const loading = postMessageMutation.isPending;
  const currentTitle = conversations.find((c) => c.id === activeId)?.title ?? "AI Assistant";

  return (
    <>
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className={`fixed left-0 top-16 bottom-0 z-20 sidebar-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <ChatSidebar
          conversations={conversations}
          activeId={activeId ?? null}
          onNew={() => {
            createConversationAndGo();
            setIsSidebarOpen(false);
          }}
          onSelect={(id) => {
            goToConversation(id);
            setIsSidebarOpen(false);
          }}
          onDelete={handleDeleteConversation}
        />
      </div>

      <div className="fixed top-16 bottom-0 left-0 right-0 md:left-64 flex flex-col bg-itin-sand-50">
        <ChatHeader 
          title={currentTitle}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <ChatMessages 
          messages={messages}
          loading={loading}
          error={error}
        />

        <ChatInputForm
          input={input}
          setInput={setInput}
          imagePreview={imagePreview}
          fileInputRef={fileInputRef}
          loading={loading}
          disabled={!activeId}
          onSubmit={onSend}
          onImageSelect={handleImageSelect}
          onClearImage={clearImage}
        />
      </div>
    </>
  );
};

export default AIChat;
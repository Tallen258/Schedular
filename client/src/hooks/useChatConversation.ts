import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useConversations, useMessages, useCreateConversation, usePostMessage } from './useAIChat';
import type { ChatMessage } from '../api/chat';

interface UseChatConversationOptions {
  conversationTitle?: string;
  autoCreate?: boolean;
  persistKey?: string;
}

export const useChatConversation = (options: UseChatConversationOptions = {}) => {
  const { conversationTitle, autoCreate = true, persistKey } = options;
  const hasTriedCreateRef = useRef(false);
  
  const getKey = useCallback((suffix: string) => persistKey ? `chat_${persistKey}_${suffix}` : null, [persistKey]);

  const [conversationId, setConversationId] = useState<number | null>(() => {
    if (!persistKey) return null;
    const key = `chat_${persistKey}_conversationId`;
    const stored = localStorage.getItem(key);
    return stored ? Number(stored) : null;
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!persistKey) return [];
    const key = `chat_${persistKey}_messages`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState(() => {
    if (!persistKey) return "";
    const key = `chat_${persistKey}_input`;
    return localStorage.getItem(key) ?? "";
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    if (!persistKey) return null;
    const key = `chat_${persistKey}_imagePreview`;
    return localStorage.getItem(key);
  });
  const [error, setError] = useState<string | null>(null);

  const conversationsQuery = useConversations();
  const conversations = useMemo(() => conversationsQuery.data ?? [], [conversationsQuery.data]);
  const createConversationMutation = useCreateConversation();
  const postMessageMutation = usePostMessage();
  const messagesQuery = useMessages(conversationId);

  // Persist to localStorage
  useEffect(() => {
    if (!persistKey) return;
    const idKey = getKey('conversationId')!;
    const msgKey = getKey('messages')!;
    const inputKey = getKey('input')!;
    const imgKey = getKey('imagePreview')!;
    
    if (conversationId !== null) localStorage.setItem(idKey, String(conversationId));
    if (messages.length > 0) localStorage.setItem(msgKey, JSON.stringify(messages));
    localStorage.setItem(inputKey, input);
    if (imagePreview) {
      localStorage.setItem(imgKey, imagePreview);
    } else {
      localStorage.removeItem(imgKey);
    }
  }, [conversationId, messages, input, imagePreview, persistKey, getKey]);

  // Initialize or reuse conversation
  useEffect(() => {
    if (!autoCreate || conversationId || conversationsQuery.isLoading || hasTriedCreateRef.current) return;
    
    const existingConvo = conversationTitle && conversations.find(c => c.title === conversationTitle);
    if (existingConvo) {
      setConversationId(existingConvo.id);
      hasTriedCreateRef.current = true;
      return;
    }
    
    if (!createConversationMutation.isPending) {
      hasTriedCreateRef.current = true;
      createConversationMutation.mutateAsync()
        .then(convo => setConversationId(convo.id))
        .catch(e => {
          setError((e as Error)?.message ?? "Failed to create conversation");
          hasTriedCreateRef.current = false;
        });
    }
  }, [autoCreate, conversationId, conversationTitle, conversations, conversationsQuery.isLoading, createConversationMutation]);

  // Load messages from server
  useEffect(() => {
    if (messagesQuery.data && (messages.length === 0 || messagesQuery.data.length > messages.length)) {
      setMessages(messagesQuery.data);
    }
    if (messagesQuery.error) {
      const errorMessage = (messagesQuery.error as Error)?.message ?? "Failed to load messages";
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setConversationId(null);
        if (persistKey) localStorage.removeItem(getKey('conversationId')!);
      } else {
        setError(errorMessage);
      }
    }
  }, [messagesQuery.data, messagesQuery.error, persistKey, getKey, messages.length]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (persistKey) localStorage.removeItem(getKey('imagePreview')!);
  };

  const clearConversation = () => {
    setMessages([]);
    setInput("");
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
    hasTriedCreateRef.current = false;
    if (persistKey) {
      ['conversationId', 'messages', 'input', 'imagePreview'].forEach(key => 
        localStorage.removeItem(getKey(key)!)
      );
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !input.trim()) return;

    const content = input.trim();
    setInput("");
    setError(null);

    const optimistic: ChatMessage = {
      id: -Date.now(),
      conversationId,
      role: "user",
      content,
      imageUrl: imagePreview || undefined,
      createdAt: new Date().toISOString(),
    };
    setMessages(m => [...m, optimistic]);

    const imageToSend = selectedImage;
    clearImage();

    try {
      const data = await postMessageMutation.mutateAsync({
        conversationId,
        content,
        imageFile: imageToSend || undefined,
      });
      setMessages(m => [
        ...m.filter(x => x.id !== optimistic.id),
        data.userMessage,
        data.assistantMessage,
      ]);
    } catch (e: unknown) {
      const errorMessage = (e as Error)?.message ?? "Send failed";
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setConversationId(null);
        setMessages([]);
        if (persistKey) {
          localStorage.removeItem(getKey('conversationId')!);
          localStorage.removeItem(getKey('messages')!);
        }
        setError("Conversation was deleted. Please try sending your message again.");
      } else {
        setError(errorMessage);
      }
      setMessages(m => m.filter(x => x.id !== optimistic.id));
      setInput(content);
      if (imageToSend) {
        setSelectedImage(imageToSend);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(imageToSend);
      }
    }
  };

  return {
    conversationId,
    messages,
    input,
    setInput,
    selectedImage,
    imagePreview,
    error,
    loading: postMessageMutation.isPending,
    handleImageSelect,
    clearImage,
    clearConversation,
    sendMessage,
  };
};

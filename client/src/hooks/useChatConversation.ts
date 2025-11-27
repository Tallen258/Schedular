import { useState, useEffect } from 'react';
import {
  useConversations,
  useMessages,
  useCreateConversation,
  usePostMessage,
} from './useAIChat';
import type { ChatMessage } from '../api/chat';

interface UseChatConversationOptions {
  conversationTitle?: string;
  autoCreate?: boolean;
  persistKey?: string; // Key for localStorage persistence
}

export const useChatConversation = (options: UseChatConversationOptions = {}) => {
  const { conversationTitle, autoCreate = true, persistKey } = options;
  
  // Helper to get localStorage key
  const getStorageKey = (suffix: string) => 
    persistKey ? `chat_${persistKey}_${suffix}` : null;

  // Initialize state from localStorage if available
  const [conversationId, setConversationId] = useState<number | null>(() => {
    if (!persistKey) return null;
    const stored = localStorage.getItem(getStorageKey('conversationId')!);
    return stored ? Number(stored) : null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!persistKey) return [];
    const stored = localStorage.getItem(getStorageKey('messages')!);
    return stored ? JSON.parse(stored) : [];
  });

  const [input, setInput] = useState(() => {
    if (!persistKey) return "";
    return localStorage.getItem(getStorageKey('input')!) || "";
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    if (!persistKey) return null;
    return localStorage.getItem(getStorageKey('imagePreview')!) || null;
  });

  const [error, setError] = useState<string | null>(null);

  const conversationsQuery = useConversations();
  const conversations = conversationsQuery.data ?? [];
  const createConversationMutation = useCreateConversation();
  const postMessageMutation = usePostMessage();
  const messagesQuery = useMessages(conversationId);

  // Persist conversationId to localStorage
  useEffect(() => {
    if (persistKey && conversationId !== null) {
      localStorage.setItem(getStorageKey('conversationId')!, String(conversationId));
    }
  }, [conversationId, persistKey]);

  // Persist messages to localStorage
  useEffect(() => {
    if (persistKey && messages.length > 0) {
      localStorage.setItem(getStorageKey('messages')!, JSON.stringify(messages));
    }
  }, [messages, persistKey]);

  // Persist input to localStorage
  useEffect(() => {
    if (persistKey) {
      localStorage.setItem(getStorageKey('input')!, input);
    }
  }, [input, persistKey]);

  // Persist imagePreview to localStorage
  useEffect(() => {
    if (persistKey) {
      if (imagePreview) {
        localStorage.setItem(getStorageKey('imagePreview')!, imagePreview);
      } else {
        localStorage.removeItem(getStorageKey('imagePreview')!);
      }
    }
  }, [imagePreview, persistKey]);

  // Initialize or reuse conversation
  useEffect(() => {
    if (autoCreate && !conversationId) {
      if (conversationTitle) {
        const existingConvo = conversations.find(c => c.title === conversationTitle);
        if (existingConvo) {
          setConversationId(existingConvo.id);
          return;
        }
      }
      
      createConversationMutation.mutateAsync().then(convo => {
        setConversationId(convo.id);
      }).catch(e => {
        const error = e as Error;
        setError(error?.message ?? "Failed to create conversation");
      });
    }
  }, [autoCreate, conversationId, conversations, conversationTitle, createConversationMutation]);

  // Load messages from server (only if we don't have cached messages)
  useEffect(() => {
    if (messagesQuery.data) {
      // Only update if we don't have messages or server has more messages
      if (messages.length === 0 || messagesQuery.data.length > messages.length) {
        setMessages(messagesQuery.data);
      }
    }
    if (messagesQuery.error) {
      const e = messagesQuery.error as Error;
      const errorMessage = e?.message ?? "Failed to load messages";
      
      // If conversation not found (404), clear the invalid ID and let autoCreate handle it
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setConversationId(null);
        if (persistKey) {
          localStorage.removeItem(getStorageKey('conversationId')!);
        }
      } else {
        setError(errorMessage);
      }
    }
  }, [messagesQuery.data, messagesQuery.error, persistKey]);

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
    if (persistKey) {
      localStorage.removeItem(getStorageKey('imagePreview')!);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setInput("");
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
    if (persistKey) {
      localStorage.removeItem(getStorageKey('conversationId')!);
      localStorage.removeItem(getStorageKey('messages')!);
      localStorage.removeItem(getStorageKey('input')!);
      localStorage.removeItem(getStorageKey('imagePreview')!);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId) return;
    const content = input.trim();
    if (!content) return;

    setInput("");
    setError(null);

    const optimistic: ChatMessage = {
      id: -Date.now(),
      conversationId: conversationId,
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
        conversationId: conversationId,
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
      const errorMessage = error?.message ?? "Send failed";
      
      // If conversation not found (404), clear the invalid ID
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setConversationId(null);
        setMessages([]);
        if (persistKey) {
          localStorage.removeItem(getStorageKey('conversationId')!);
          localStorage.removeItem(getStorageKey('messages')!);
        }
        setError("Conversation was deleted. Please try sending your message again.");
      } else {
        setError(errorMessage);
      }
      
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

// src/api/chat.ts
import api from '../services/api';

export type ChatMessage = {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Fetch all conversations for the current user
 */
export async function fetchConversations(): Promise<Conversation[]> {
  const response = await api.get<Conversation[]>('/api/conversations');
  return response.data;
}

/**
 * Create a new conversation
 */
export async function createConversation(): Promise<Conversation> {
  const response = await api.post<Conversation>('/api/conversations', {
    title: 'New chat',
  });
  return response.data;
}

/**
 * Fetch all messages in a conversation
 */
export async function fetchMessages(conversationId: number): Promise<ChatMessage[]> {
  const response = await api.get<ChatMessage[]>(`/api/conversations/${conversationId}/messages`);
  return response.data;
}

/**
 * Post a message to a conversation and get AI response
 */
export async function postMessage(
  conversationId: number,
  content: string,
  model?: string
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
  const response = await api.post<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>(
    `/api/conversations/${conversationId}/messages`,
    { content, model }
  );
  return response.data;
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: number): Promise<void> {
  await api.delete(`/api/conversations/${conversationId}`);
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(conversationId: number, title: string): Promise<Conversation> {
  const response = await api.patch<Conversation>(`/api/conversations/${conversationId}`, { title });
  return response.data;
}

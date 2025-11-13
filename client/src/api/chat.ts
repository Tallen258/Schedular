// src/api/chat.ts
import api from '../services/api';

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

/**
 * Send a simple chat message to the AI assistant
 */
export async function sendChatMessage(content: string): Promise<string> {
  const response = await api.post<{ reply: string }>('/api/chat', {
    content,
  });

  return response.data.reply;
}

/**
 * Send a conversation with full message history to the AI assistant
 */
export async function sendChatConversation(messages: ChatMessage[]): Promise<string> {
  const response = await api.post<{ reply: string }>('/api/chat', {
    messages,
  });

  return response.data.reply;
}

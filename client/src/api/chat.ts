// src/api/chat.ts
import api from './client';

export type ChatMessage = {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  createdAt: string;
};

export type Conversation = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
};


export async function fetchConversations(): Promise<Conversation[]> {
  const response = await api.get<Conversation[]>('/api/conversations');
  return response.data;
}

export async function createConversation(): Promise<Conversation> {
  const response = await api.post<Conversation>('/api/conversations', {
    title: 'New chat',
  });
  return response.data;
}


export async function fetchMessages(conversationId: number): Promise<ChatMessage[]> {
  const response = await api.get<ChatMessage[]>(`/api/conversations/${conversationId}/messages`);
  return response.data;
}


export async function postMessage(
  conversationId: number,
  content: string,
  model?: string,
  imageFile?: File
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
  const formData = new FormData();
  formData.append('content', content);
  if (model) formData.append('model', model);
  if (imageFile) formData.append('image', imageFile);

  const response = await api.post<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>(
    `/api/conversations/${conversationId}/messages`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}


export async function deleteConversation(conversationId: number): Promise<void> {
  await api.delete(`/api/conversations/${conversationId}`);
}


export async function updateConversationTitle(conversationId: number, title: string): Promise<Conversation> {
  const response = await api.patch<Conversation>(`/api/conversations/${conversationId}`, { title });
  return response.data;
}

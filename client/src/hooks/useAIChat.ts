// src/hooks/useAIChat.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as chatApi from '../api/chat';

// Query keys
export const conversationsKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationsKeys.all, 'list'] as const,
  list: (filters: string) => [...conversationsKeys.all, 'list', { filters }] as const,
  details: () => [...conversationsKeys.all, 'detail'] as const,
  detail: (id: number) => [...conversationsKeys.all, 'detail', id] as const,
};

export const messagesKeys = {
  all: ['messages'] as const,
  lists: () => [...messagesKeys.all, 'list'] as const,
  list: (conversationId: number) => [...messagesKeys.all, 'list', conversationId] as const,
};

// Hooks
export function useConversations() {
  return useQuery({
    queryKey: conversationsKeys.lists(),
    queryFn: chatApi.fetchConversations,
  });
}

export function useMessages(conversationId: number | null) {
  return useQuery({
    queryKey: conversationId ? messagesKeys.list(conversationId) : ['messages', 'idle'],
    queryFn: async () => (conversationId ? chatApi.fetchMessages(conversationId) : []),
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: chatApi.createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() });
    },
  });
}

export function usePostMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, content, model }: { conversationId: number; content: string; model?: string }) =>
      chatApi.postMessage(conversationId, content, model),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.list(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: chatApi.deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() });
    },
  });
}

export function useUpdateConversationTitle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, title }: { conversationId: number; title: string }) =>
      chatApi.updateConversationTitle(conversationId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() });
    },
  });
}

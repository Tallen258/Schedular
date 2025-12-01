import { useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
} from "./useAIChat";

export const useConversationManagement = (activeId: number | null) => {
  const nav = useNavigate();
  const conversationsQuery = useConversations();
  const conversations = useMemo(() => conversationsQuery.data ?? [], [conversationsQuery.data]);
  const createConversationMutation = useCreateConversation();
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
      throw new Error(error?.message ?? "Failed to create conversation");
    }
  }, [createConversationMutation, nav]);

  const handleDeleteConversation = useCallback(async (id: number) => {
    try {
      await deleteConversationMutation.mutateAsync(id);
      
      if (activeId === id) {
        const remainingConvos = conversations.filter(c => c.id !== id);
        if (remainingConvos.length > 0) {
          nav(`/chat/${remainingConvos[0].id}`);
        } else {
          const newConvo = await createConversationMutation.mutateAsync();
          nav(`/chat/${newConvo.id}`);
        }
      }
    } catch (e: unknown) {
      const error = e as Error;
      throw new Error(error?.message ?? "Failed to delete conversation");
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

  return {
    conversations,
    goToConversation,
    createConversationAndGo,
    handleDeleteConversation,
  };
};

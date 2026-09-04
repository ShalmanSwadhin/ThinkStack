import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import aiTutorApi from './aiTutorService';
import { isComingSoonPayload } from '../../utils/apiPayload';

export function useAITutor() {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [mockMode, setMockMode] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);

  const context = useMemo(
    () => ({
      topicSlug: searchParams.get('topic') || undefined,
      problemSlug: searchParams.get('problem') || undefined,
    }),
    [searchParams]
  );

  const loadConversations = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      const data = await aiTutorApi.listConversations({ limit: 50 });
      setConversations(data.conversations ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load conversations');
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  const loadConversation = useCallback(async (id) => {
    if (!id) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    setIsLoadingChat(true);
    setError(null);
    try {
      const data = await aiTutorApi.getConversation(id);
      setActiveConversation(data);
      setMessages(data.messages ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load conversation');
    } finally {
      setIsLoadingChat(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const startNewChat = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
    setError(null);
  }, []);

  const selectConversation = useCallback(
    (id) => {
      loadConversation(id);
    },
    [loadConversation]
  );

  const deleteConversation = useCallback(
    async (id) => {
      setError(null);
      try {
        await aiTutorApi.deleteConversation(id);
        if (activeConversation?.id === id) {
          startNewChat();
        }
        await loadConversations();
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to delete conversation');
      }
    },
    [activeConversation?.id, loadConversations, startNewChat]
  );

  const sendMessage = useCallback(
    async (message) => {
      const trimmed = String(message || '').trim();
      if (!trimmed) return null;

      setIsSending(true);
      setError(null);

      const optimisticUserMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      setMessages((current) => [...current, optimisticUserMessage]);

      try {
        const data = await aiTutorApi.sendMessage({
          conversationId: activeConversation?.id,
          message: trimmed,
          context,
        });

        if (isComingSoonPayload(data)) {
          setComingSoon(true);
          setError(null);
          setMessages((current) => current.filter((item) => item.id !== optimisticUserMessage.id));
          return null;
        }

        setComingSoon(false);
        setMockMode(Boolean(data.mockMode));

        if (!activeConversation?.id) {
          await loadConversations();
          await loadConversation(data.conversationId);
        } else {
          setMessages((current) => {
            const withoutOptimistic = current.filter((item) => item.id !== optimisticUserMessage.id);
            return [...withoutOptimistic, data.userMessage, data.reply];
          });
          await loadConversations();
        }

        return data;
      } catch (err) {
        setMessages((current) => current.filter((item) => item.id !== optimisticUserMessage.id));
        setError(err.response?.data?.error?.message || 'Failed to send message');
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [activeConversation?.id, context, loadConversation, loadConversations]
  );

  return {
    conversations,
    activeConversation,
    messages,
    context,
    isLoadingList,
    isLoadingChat,
    isSending,
    error,
    mockMode,
    comingSoon,
    setComingSoon,
    startNewChat,
    selectConversation,
    deleteConversation,
    sendMessage,
    refreshConversations: loadConversations,
  };
}

export default useAITutor;

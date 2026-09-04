import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAITutor } from '../features/ai-tutor/useAITutor';
import ChatSidebar from '../features/ai-tutor/components/ChatSidebar';
import ChatMessage from '../features/ai-tutor/components/ChatMessage';
import ChatInput from '../features/ai-tutor/components/ChatInput';
import SuggestedPrompts from '../features/ai-tutor/components/SuggestedPrompts';
import { SUGGESTED_PROMPTS } from '../features/ai-tutor/constants';
import ComingSoonPlaceholder, { COMING_SOON_COPY } from '../components/ui/ComingSoonPlaceholder';
import useIntegrationStatus from '../features/integrations/useIntegrationStatus';

export default function AITutorPage() {
  const tutor = useAITutor();
  const integrations = useIntegrationStatus();
  const messagesEndRef = useRef(null);
  const aiUnavailable = integrations.geminiComingSoon || tutor.comingSoon;

  useEffect(() => {
    if (integrations.geminiComingSoon) {
      tutor.setComingSoon(true);
    }
  }, [integrations.geminiComingSoon, tutor.setComingSoon]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutor.messages, tutor.isSending]);

  const contextLabel = tutor.context.topicSlug
    ? `Topic: ${tutor.context.topicSlug}`
    : tutor.context.problemSlug
      ? `Problem: ${tutor.context.problemSlug}`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-container py-6 pb-24 lg:pb-8"
    >
      <div className="mb-6">
        <h1 className="page-heading">AI Tutor</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Ask about DSA concepts, complexity, interview prep, hints, and code review.
        </p>
      </div>

      {aiUnavailable && (
        <ComingSoonPlaceholder
          className="mb-4"
          service="gemini"
          title={COMING_SOON_COPY.gemini.title}
          message={COMING_SOON_COPY.gemini.message}
        />
      )}

      {tutor.error && !aiUnavailable && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          {tutor.error}
        </div>
      )}

      <div className="grid min-h-[640px] min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="glass-card min-h-[320px] overflow-hidden lg:min-h-[640px]">
          <ChatSidebar
            conversations={tutor.conversations}
            activeConversationId={tutor.activeConversation?.id}
            isLoading={tutor.isLoadingList}
            onSelect={tutor.selectConversation}
            onNewChat={tutor.startNewChat}
            onDelete={tutor.deleteConversation}
          />
        </aside>

        <section className="glass-card flex min-h-[640px] flex-col overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {tutor.activeConversation?.title || 'New conversation'}
              </p>
              {contextLabel ? (
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {contextLabel}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-auto p-4">
            {tutor.isLoadingChat ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading conversation…
              </div>
            ) : tutor.messages.length === 0 ? (
              <div className="space-y-4">
                {!aiUnavailable && (
                  <>
                    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-600">
                      <span className="text-3xl">🤖</span>
                      <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">
                        Start a conversation with your AI tutor
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Try a suggested prompt below or ask your own question.
                      </p>
                    </div>
                    <SuggestedPrompts
                      prompts={SUGGESTED_PROMPTS}
                      onSelect={tutor.sendMessage}
                      disabled={tutor.isSending || aiUnavailable}
                    />
                  </>
                )}
              </div>
            ) : (
              <>
                {tutor.messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {tutor.isSending && (
                  <div className="text-sm text-slate-500 dark:text-slate-400">Thinking…</div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <ChatInput
            onSend={tutor.sendMessage}
            disabled={tutor.isSending || tutor.isLoadingChat || aiUnavailable}
            disabledReason={aiUnavailable ? 'Requires API configuration' : undefined}
            placeholder={
              aiUnavailable
                ? 'AI Tutor will be available once the service is configured…'
                : 'Ask about a concept, request a hint, or paste code for review…'
            }
          />
        </section>
      </div>
    </motion.div>
  );
}

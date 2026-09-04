import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTopic } from '../features/learning/useTopic';
import learningApi from '../features/learning/learningService';
import TopicReader from '../features/learning/components/TopicReader';
import ProgressBadge from '../features/learning/components/ProgressBadge';
import TopicReaderSkeleton from '../features/learning/components/TopicReaderSkeleton';
import BookmarkButton from '../features/bookmarks/components/BookmarkButton';
import Button from '../components/ui/Button';

const FLUSH_INTERVAL_MS = 5 * 60 * 1000;

export default function TopicReaderPage() {
  const { slug } = useParams();
  const { topic, isLoading, error, isUpdating, refetch, markComplete } = useTopic(slug);
  const [completionMessage, setCompletionMessage] = useState('');
  const [allTopics, setAllTopics] = useState([]);
  const sessionStartRef = useRef(Date.now());
  const lastFlushRef = useRef(Date.now());

  useEffect(() => {
    learningApi.listTopics().then((data) => {
      const flat = (data.categories ?? []).flatMap((category) => category.topics ?? []);
      setAllTopics(flat);
    }).catch(() => {});
  }, []);

  const { previousLesson, nextLesson } = useMemo(() => {
    if (topic?.navigation?.previousLesson || topic?.navigation?.nextLesson) {
      return {
        previousLesson: topic.navigation.previousLesson,
        nextLesson: topic.navigation.nextLesson,
      };
    }

    const index = allTopics.findIndex((item) => item.slug === slug);
    if (index < 0) return { previousLesson: null, nextLesson: null };
    return {
      previousLesson: index > 0 ? allTopics[index - 1] : null,
      nextLesson: index < allTopics.length - 1 ? allTopics[index + 1] : null,
    };
  }, [allTopics, slug, topic?.navigation]);

  const flushReadingTime = useCallback(
    async (useKeepalive = false) => {
      if (!slug) return;
      const elapsedMs = Date.now() - lastFlushRef.current;
      const minutes = Math.max(1, Math.round(elapsedMs / 60000));
      if (minutes < 1) return;

      if (useKeepalive) {
        learningApi.recordTimeKeepalive(slug, minutes);
      } else {
        await learningApi.recordTime(slug, minutes).catch(() => {});
      }
      lastFlushRef.current = Date.now();
    },
    [slug]
  );

  useEffect(() => {
    sessionStartRef.current = Date.now();
    lastFlushRef.current = Date.now();

    const interval = window.setInterval(() => {
      flushReadingTime(false);
    }, FLUSH_INTERVAL_MS);

    const onPageHide = () => {
      flushReadingTime(true);
    };

    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('pagehide', onPageHide);
      flushReadingTime(true);
    };
  }, [slug, flushReadingTime]);

  const handleMarkComplete = async () => {
    const result = await markComplete();
    if (result?.xpAwarded > 0) {
      setCompletionMessage(`+${result.xpAwarded} XP awarded!`);
    }
  };

  if (isLoading) {
    return <TopicReaderSkeleton />;
  }

  if (error || !topic) {
    return (
      <div className="page-container py-8">
        <div className="mx-auto max-w-lg rounded-xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950">
          <p className="font-medium text-rose-700 dark:text-rose-300">
            {error || 'Topic not found'}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/learn">
              <Button variant="secondary" size="sm">
                Back to topics
              </Button>
            </Link>
            <Button size="sm" onClick={refetch}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/learn"
          className="mb-4 inline-flex text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          ← All topics
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium capitalize text-slate-500 dark:text-slate-400">
              {topic.categoryLabel}
            </p>
            <h1 className="mt-1 text-balance text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">{topic.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="capitalize">{topic.difficulty}</span>
              <span>·</span>
              <span>~{topic.estimatedMinutes} min read</span>
              <span>·</span>
              <span>+{topic.xpReward} XP</span>
              <ProgressBadge status={topic.progress?.status} />
            </div>
          </div>
          <BookmarkButton targetType="topic" targetId={topic.id} targetSlug={topic.slug} size="md" />
        </div>

        <TopicReader
          topic={topic}
          onMarkComplete={handleMarkComplete}
          isUpdating={isUpdating}
          completionMessage={completionMessage}
          previousLesson={previousLesson}
          nextLesson={nextLesson}
        />
      </motion.div>
    </div>
  );
}

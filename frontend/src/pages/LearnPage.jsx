import { useMemo } from 'react';

import { motion } from 'framer-motion';

import { useTopics } from '../features/learning/useTopics';

import LearnPageSkeleton from '../features/learning/components/LearnPageSkeleton';

import CurriculumIndex from '../features/learning/components/CurriculumIndex';

import CurriculumContent from '../features/learning/components/CurriculumContent';

import { BookmarkStatusProvider } from '../features/bookmarks/BookmarkStatusContext';

import { buildCurriculumStructure } from '../features/learning/utils/buildCurriculumStructure';

import Card, { CardContent } from '../components/ui/Card';

import Button from '../components/ui/Button';



export default function LearnPage() {

  const { categories, summary, isLoading, error, refetch } = useTopics();



  const topicIds = useMemo(

    () => categories.flatMap((category) => category.topics.map((topic) => topic.id)),

    [categories]

  );



  const curriculumGroups = useMemo(

    () => buildCurriculumStructure(categories),

    [categories]

  );



  if (isLoading) {

    return <LearnPageSkeleton />;

  }



  return (

    <BookmarkStatusProvider targetType="topic" targetIds={topicIds}>

      <div className="page-container py-8 pb-24 lg:pb-8">

        <motion.div

          initial={{ opacity: 0, y: 16 }}

          animate={{ opacity: 1, y: 0 }}

          className="mb-8"

        >

          <h1 className="page-heading">Learn DSA</h1>

          <p className="page-subheading">

            {summary?.total ?? topicIds.length} structured lessons across {curriculumGroups.reduce((n, g) => n + g.modules.length, 0)} modules.

            Use the curriculum index to jump directly to any topic.

          </p>

        </motion.div>



        {error && (

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">

            <span>{error}</span>

            <Button size="sm" variant="secondary" onClick={refetch}>

              Retry

            </Button>

          </div>

        )}



        {summary && (

          <div className="mb-8 grid gap-4 sm:grid-cols-3">

            {[

              { label: 'Total Lessons', value: summary.total },

              { label: 'Completed', value: summary.completed },

              { label: 'In Progress', value: summary.inProgress },

            ].map((stat) => (

              <Card key={stat.label} glass>

                <CardContent className="pt-2">

                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>

                  <p className="text-3xl font-bold text-brand-600">{stat.value}</p>

                </CardContent>

              </Card>

            ))}

          </div>

        )}



        {!curriculumGroups.length && !error ? (

          <Card className="text-center">

            <CardContent className="py-12">

              <span className="text-4xl">📚</span>

              <p className="mt-3 font-medium text-slate-600 dark:text-slate-300">No topics available</p>

              <p className="mt-1 text-sm text-slate-400">

                Run the seed script to populate learning content.

              </p>

            </CardContent>

          </Card>

        ) : (

          <div className="lg:grid lg:grid-cols-[minmax(240px,280px)_1fr] lg:gap-8">

            <CurriculumIndex curriculumGroups={curriculumGroups} />

            <CurriculumContent curriculumGroups={curriculumGroups} />

          </div>

        )}

      </div>

    </BookmarkStatusProvider>

  );

}



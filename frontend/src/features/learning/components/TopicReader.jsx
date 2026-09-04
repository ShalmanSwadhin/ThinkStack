import { Link } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import MarkdownContent from './MarkdownContent';
import CodeBlock from './CodeBlock';
import LessonNavigation from './LessonNavigation';

function Section({ id, title, children }) {
  if (!children) return null;
  return (
    <section id={id} className="scroll-mt-24">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}

function BulletList({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

const tocItems = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'theory', label: 'Theory' },
  { id: 'explanation', label: 'Explanation' },
  { id: 'example', label: 'Example' },
  { id: 'real-world', label: 'Real World' },
  { id: 'pros-cons', label: 'Pros & Cons' },
  { id: 'applications', label: 'Applications' },
  { id: 'complexity', label: 'Complexity' },
  { id: 'mistakes', label: 'Common Mistakes' },
  { id: 'interview', label: 'Interview Tips' },
  { id: 'code', label: 'Real Code' },
  { id: 'problems', label: 'Practice Problems' },
  { id: 'summary', label: 'Summary' },
  { id: 'quiz', label: 'Quiz' },
];

export default function TopicReader({
  topic,
  onMarkComplete,
  isUpdating,
  completionMessage,
  previousLesson,
  nextLesson,
}) {
  const { content } = topic;
  const isCompleted = topic.progress?.status === 'completed';

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav className="sticky top-24 rounded-xl border bg-white p-4 dark:bg-slate-800">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            On this page
          </p>
          <ul className="space-y-2 text-sm">
            {tocItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="space-y-6">
        <Section id="introduction" title="Introduction">
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">{content.introduction}</p>
        </Section>

        <Section id="theory" title="Theory">
          <MarkdownContent content={content.theory} />
        </Section>

        <Section id="explanation" title="Explanation">
          <MarkdownContent
            content={
              content.explanation ??
              content.theory ??
              'This section explains the core idea in simple terms so you can understand the concept before diving into code.'
            }
          />
        </Section>

        <Section id="example" title="Example">
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">
            {content.example ??
              content.realWorldExample ??
              'Walk through a concrete example to see how this data structure or algorithm behaves in practice.'}
          </p>
        </Section>

        <Section id="real-world" title="Real-World Example">
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">
            {content.realWorldExample}
          </p>
        </Section>

        <Section id="pros-cons" title="Advantages & Disadvantages">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium text-emerald-700 dark:text-emerald-400">Advantages</h4>
              <BulletList items={content.advantages} />
            </div>
            <div>
              <h4 className="mb-2 font-medium text-rose-700 dark:text-rose-400">Disadvantages</h4>
              <BulletList items={content.disadvantages} />
            </div>
          </div>
        </Section>

        <Section id="applications" title="Applications">
          <BulletList items={content.applications} />
        </Section>

        <Section id="complexity" title="Time & Space Complexity">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-400">Time</p>
              <p className="mt-1 text-slate-800 dark:text-slate-200">{content.timeComplexity}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-400">Space</p>
              <p className="mt-1 text-slate-800 dark:text-slate-200">{content.spaceComplexity}</p>
            </div>
          </div>
          {topic.animationConfig?.type && (
            <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-slate-600 dark:text-slate-400">
              <Link to={topic.links.visualizer} className="font-medium text-brand-600 hover:underline">
                Open visualizer for this topic
              </Link>
            </div>
          )}
        </Section>

        <Section id="mistakes" title="Common Mistakes">
          <BulletList items={content.commonMistakes} />
        </Section>

        <Section id="interview" title="Interview Tips">
          <div className="space-y-4">
            {content.interviewQuestions?.map((item, index) => (
              <details
                key={index}
                className="group rounded-xl border bg-slate-50 dark:bg-slate-900"
              >
                <summary className="cursor-pointer px-4 py-3 font-medium text-slate-900 dark:text-white">
                  {item.question}
                </summary>
                <p className="border-t px-4 py-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </Section>

        <Section id="code" title="Real Code">
          <CodeBlock topicSlug={topic.slug} examples={content.codeExamples} />
        </Section>

        <Section id="problems" title="Practice Problems">
          {topic.relatedProblems?.length ? (
            <ul className="space-y-2">
              {topic.relatedProblems.map((problem) => (
                <li key={problem.id}>
                  <Link
                    to={`/problems/${problem.slug}`}
                    className="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-700 dark:hover:bg-brand-950"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">
                      {problem.title}
                    </span>
                    <span className="text-xs capitalize text-slate-500">{problem.difficulty}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No practice problems linked to this topic yet.
            </p>
          )}
        </Section>

        <Section id="summary" title="Summary">
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">{content.summary}</p>
        </Section>

        <Section id="quiz" title="Topic Quiz">
          {topic.quiz ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{topic.quiz.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Test your understanding with the topic quiz
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={topic.links.quiz}>
                  <Button variant="secondary" size="sm">
                    Take Quiz
                  </Button>
                </Link>
                {topic.links?.aiTutor ? (
                  <Link to={topic.links.aiTutor}>
                    <Button variant="ghost" size="sm">
                      Ask AI Tutor
                    </Button>
                  </Link>
                ) : null}
                <Link to={`/notes?topic=${topic.slug}`}>
                  <Button variant="ghost" size="sm">
                    Take Notes
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No quiz linked to this topic.</p>
          )}
        </Section>

        <Card className="border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-950">
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {isCompleted ? 'Topic completed' : 'Finished reading?'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isCompleted
                  ? `You earned +${topic.xpReward} XP for completing this topic.`
                  : `Mark complete to earn +${topic.xpReward} XP.`}
              </p>
              {completionMessage && (
                <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {completionMessage}
                </p>
              )}
            </div>
            <Button onClick={onMarkComplete} disabled={isCompleted || isUpdating}>
              {isCompleted ? 'Completed' : isUpdating ? 'Saving…' : 'Mark as Complete'}
            </Button>
          </CardContent>
        </Card>

        <LessonNavigation
          previousLesson={previousLesson}
          nextLesson={nextLesson}
          className="mt-2"
        />
      </div>
    </div>
  );
}

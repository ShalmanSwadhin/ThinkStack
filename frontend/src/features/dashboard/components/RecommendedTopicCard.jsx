import { Link } from 'react-router-dom';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const difficultyColors = {
  beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};

export default function RecommendedTopicCard({ topic }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Next</CardTitle>
        <CardDescription>Continue your learning path</CardDescription>
      </CardHeader>
      <CardContent>
        {!topic ? (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="text-4xl">🎉</span>
            <p className="mt-3 font-medium text-slate-600 dark:text-slate-300">
              All topics completed!
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Great work — explore problems and quizzes to keep sharpening your skills.
            </p>
            <Link to="/problems" className="mt-4">
              <Button size="sm" variant="secondary">
                Browse Problems
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{topic.title}</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {topic.category}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${difficultyColors[topic.difficulty] ?? difficultyColors.beginner}`}
                >
                  {topic.difficulty}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  ~{topic.estimatedMinutes} min
                </span>
              </div>
            </div>
            <Link to={`/learn/${topic.slug}`}>
              <Button size="sm">Start Learning</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

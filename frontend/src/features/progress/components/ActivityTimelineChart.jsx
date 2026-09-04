import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useMemo } from 'react';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

function formatLabel(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ActivityTimelineChart({ activityTimeline }) {
  const isDark =
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const chartData = useMemo(() => {
    const labels = activityTimeline.map((item) => formatLabel(item.date));
    return {
      labels,
      datasets: [
        {
          label: 'Topics completed',
          data: activityTimeline.map((item) => item.topicsCompleted),
          borderColor: isDark ? '#818cf8' : '#4f46e5',
          backgroundColor: isDark ? 'rgba(129, 140, 248, 0.15)' : 'rgba(79, 70, 229, 0.1)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Problems solved',
          data: activityTimeline.map((item) => item.problemsSolved),
          borderColor: isDark ? '#34d399' : '#059669',
          backgroundColor: 'transparent',
          tension: 0.3,
        },
        {
          label: 'Quiz attempts',
          data: activityTimeline.map((item) => item.quizAttempts),
          borderColor: isDark ? '#fbbf24' : '#d97706',
          backgroundColor: 'transparent',
          tension: 0.3,
        },
      ],
    };
  }, [activityTimeline, isDark]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: isDark ? '#94a3b8' : '#64748b' },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: isDark ? '#94a3b8' : '#64748b',
          },
          grid: { color: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)' },
        },
        x: {
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b',
            maxTicksLimit: 8,
          },
          grid: { display: false },
        },
      },
    }),
    [isDark]
  );

  const hasActivity = activityTimeline.some((item) => item.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Over Time</CardTitle>
        <CardDescription>Last 30 days of learning activity</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasActivity ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <span className="text-4xl">📈</span>
            <p className="mt-3 font-medium text-slate-600 dark:text-slate-300">No activity yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Complete topics, solve problems, or take quizzes to see your trend.
            </p>
          </div>
        ) : (
          <div className="h-64">
            <Line data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useMemo } from 'react';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CategoryProgressChart({ categoryProgress }) {
  const isDark =
    typeof window !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  const chartData = useMemo(() => {
    const labels = categoryProgress.map((item) => item.label);
    const values = categoryProgress.map((item) => item.percentComplete);

    return {
      labels,
      datasets: [
        {
          label: '% Complete',
          data: values,
          backgroundColor: isDark ? 'rgba(129, 140, 248, 0.7)' : 'rgba(79, 70, 229, 0.7)',
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [categoryProgress, isDark]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: (context) => {
              const item = categoryProgress[context.dataIndex];
              return `${item.completed} of ${item.total} topics`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`,
            color: isDark ? '#94a3b8' : '#64748b',
          },
          grid: { color: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)' },
        },
        x: {
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b',
            maxRotation: 45,
            minRotation: 0,
          },
          grid: { display: false },
        },
      },
    }),
    [categoryProgress, isDark]
  );

  const hasTopics = categoryProgress.some((item) => item.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Progress</CardTitle>
        <CardDescription>Completion by topic category</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasTopics ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <span className="text-4xl">📊</span>
            <p className="mt-3 font-medium text-slate-600 dark:text-slate-300">No topics yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Topics will appear here once learning content is available.
            </p>
          </div>
        ) : (
          <div className="h-64">
            <Bar data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

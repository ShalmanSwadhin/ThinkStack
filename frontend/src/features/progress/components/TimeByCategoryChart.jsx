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

export default function TimeByCategoryChart({ timeByCategory }) {
  const isDark =
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const chartData = useMemo(
    () => ({
      labels: timeByCategory.map((item) => item.label),
      datasets: [
        {
          label: 'Minutes spent',
          data: timeByCategory.map((item) => item.minutes),
          backgroundColor: isDark ? 'rgba(52, 211, 153, 0.7)' : 'rgba(5, 150, 105, 0.7)',
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    }),
    [timeByCategory, isDark]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.y} min`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value}m`,
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
    [isDark]
  );

  const hasTime = timeByCategory.some((item) => item.minutes > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time by Category</CardTitle>
        <CardDescription>Study time spent per module</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasTime ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <span className="text-4xl">⏱️</span>
            <p className="mt-3 font-medium text-slate-600 dark:text-slate-300">No time tracked yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Time is recorded while reading topics in the learning module.
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

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useMemo } from 'react';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

function formatLabel(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function AdminTrendChart({ title, description, timeline, label = 'Count' }) {
  const isDark =
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const chartData = useMemo(
    () => ({
      labels: (timeline ?? []).map((item) => formatLabel(item.date)),
      datasets: [
        {
          label,
          data: (timeline ?? []).map((item) => item.count),
          borderColor: isDark ? '#818cf8' : '#4f46e5',
          backgroundColor: isDark ? 'rgba(129, 140, 248, 0.15)' : 'rgba(79, 70, 229, 0.1)',
          fill: true,
          tension: 0.3,
        },
      ],
    }),
    [timeline, isDark, label]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: isDark ? '#94a3b8' : '#64748b' } },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: isDark ? '#94a3b8' : '#64748b' },
          grid: { color: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)' },
        },
        x: {
          ticks: { color: isDark ? '#94a3b8' : '#64748b', maxTicksLimit: 8 },
          grid: { display: false },
        },
      },
    }),
    [isDark]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminPopularTopicsChart({ topics }) {
  const isDark =
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const chartData = useMemo(
    () => ({
      labels: (topics ?? []).map((topic) => topic.title),
      datasets: [
        {
          label: 'Completions',
          data: (topics ?? []).map((topic) => topic.completions),
          backgroundColor: isDark ? '#6366f1' : '#818cf8',
        },
      ],
    }),
    [topics, isDark]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: isDark ? '#94a3b8' : '#64748b' },
        },
        x: {
          ticks: { color: isDark ? '#94a3b8' : '#64748b' },
        },
      },
    }),
    [isDark]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Topics</CardTitle>
        <CardDescription>Most completed learning topics</CardDescription>
      </CardHeader>
      <CardContent>
        {!topics?.length ? (
          <p className="py-16 text-center text-sm text-slate-500">No completion data yet.</p>
        ) : (
          <div className="h-64">
            <Bar data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminTrendChart;

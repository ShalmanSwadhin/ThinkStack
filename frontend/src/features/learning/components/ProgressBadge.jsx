import { cn } from '../../../utils/cn';

const statusConfig = {
  not_started: {
    label: 'Not started',
    className: 'badge-neutral',
  },
  in_progress: {
    label: 'In progress',
    className: 'badge-warning',
  },
  completed: {
    label: 'Completed',
    className: 'badge-success',
  },
};

export default function ProgressBadge({ status = 'not_started', className }) {
  const config = statusConfig[status] ?? statusConfig.not_started;

  return (
    <span className={cn(config.className, 'capitalize', className)}>
      {config.label}
    </span>
  );
}

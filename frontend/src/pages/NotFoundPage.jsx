import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="page-container flex min-h-[60vh] flex-col items-center justify-center py-16">
      <div className="empty-state max-w-md border-solid">
        <span className="empty-state-icon text-brand-200 dark:text-brand-900" aria-hidden="true">
          404
        </span>
        <h1 className="empty-state-title text-2xl">Page not found</h1>
        <p className="empty-state-desc">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link to="/" className="mt-8">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}

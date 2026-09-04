export default function LearnPageSkeleton() {
  return (
    <div className="page-container py-8">
      <div className="skeleton mb-8 h-8 w-48" />
      <div className="skeleton mb-6 h-4 w-96" />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="stat-card">
            <div className="skeleton h-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

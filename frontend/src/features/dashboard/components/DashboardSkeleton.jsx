export default function DashboardSkeleton() {
  return (
    <div className="page-container py-8">
      <div className="mb-8">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton mt-3 h-4 w-72" />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="stat-card">
            <div className="skeleton h-4 w-16" />
            <div className="skeleton mt-4 h-9 w-20" />
            <div className="skeleton mt-2 h-3 w-12" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card-base">
            <div className="skeleton mb-4 h-6 w-40" />
            <div className="skeleton h-48 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

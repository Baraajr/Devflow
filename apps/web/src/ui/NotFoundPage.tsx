import { NavLink, useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-center">
      <div className="max-w-md space-y-4">
        {/* Error Code */}
        <p className="text-6xl font-extrabold tracking-tight text-primary sm:text-7xl">
          404
        </p>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Page not found
        </h1>

        {/* Description */}
        <p className="text-sm text-muted-foreground sm:text-base">
          Sorry, we couldn’t find the page you’re looking for. It might have
          been removed, renamed, or did not exist in the first place.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex w-full items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
          >
            Go back
          </button>

          <NavLink
            to="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
          >
            Back to dashboard
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;

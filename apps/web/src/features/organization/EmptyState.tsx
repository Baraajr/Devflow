function EmptyState() {
  return (
    <div className="flex min-h-100 flex-col items-center justify-center px-6 text-center">
      <h2 className="text-lg font-semibold">No organizations yet</h2>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Create your first organization to start working with your team.
      </p>
    </div>
  );
}

export default EmptyState;

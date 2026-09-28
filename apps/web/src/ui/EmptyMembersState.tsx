import { Search } from 'lucide-react';

type EmptyMembersStateProps = {
  search?: string;
  emptyMessage?: string;
};

function EmptyMembersState({
  search,
  emptyMessage = 'There are no members.',
}: EmptyMembersStateProps) {
  const hasSearch = Boolean(search?.trim());

  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Search className="h-5 w-5" />
      </div>

      <h3 className="mt-4 font-medium">
        {hasSearch ? 'No members found' : 'No members'}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasSearch ? 'Try adjusting your search.' : emptyMessage}
      </p>
    </div>
  );
}

export default EmptyMembersState;

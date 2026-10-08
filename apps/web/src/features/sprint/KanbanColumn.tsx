import { useDroppable } from '@dnd-kit/core';

import type { Issue } from '../../types/issue';
import KanbanIssueCard from './KanbanIssueCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  issues: Issue[];
  /** Height of the dragged card. Null when this column shouldn't show a ghost. */
  placeholderHeight?: number | null;
}

function KanbanColumn({
  id,
  title,
  issues,
  placeholderHeight = null,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const showPlaceholder = isOver && placeholderHeight != null;

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-125 flex-col rounded-2xl border p-3 transition-colors duration-200 ${
        isOver
          ? 'border-primary/40 bg-primary/5 ring-2 ring-primary/20'
          : 'border-border/60 bg-background'
      }`}
    >
      <header className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold tracking-tight text-primary">
            {title}
          </h3>

          <span className="min-w-5 rounded-full bg-muted px-1.5 py-0.5 text-center text-xs font-medium tabular-nums text-muted-foreground">
            {issues.length}
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col">
        {issues.length > 0 || showPlaceholder ? (
          <div className="space-y-3">
            {issues.map((issue) => (
              <KanbanIssueCard key={issue.id} issue={issue} />
            ))}

            {showPlaceholder && (
              <div
                aria-hidden="true"
                style={{ height: placeholderHeight }}
                className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5"
              />
            )}
          </div>
        ) : (
          <div
            className={`flex flex-1 items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center text-xs transition-colors duration-200 ${
              isOver
                ? 'border-primary/40 text-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            {isOver ? 'Release to drop here' : 'No issues'}
          </div>
        )}
      </div>
    </section>
  );
}

export default KanbanColumn;

import { useDraggable } from '@dnd-kit/core';

import type { Issue } from '../../types/issue';

interface KanbanIssueCardProps {
  issue: Issue;
}

const MAX_VISIBLE_LABELS = 2;

function KanbanIssueCard({ issue }: KanbanIssueCardProps) {
  // No transform here: <DragOverlay> renders the moving card,
  // so the original stays put as a placeholder.
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: issue.id,
  });

  const labels = issue.labels ?? [];
  const hiddenCount = labels.length - MAX_VISIBLE_LABELS;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group touch-none select-none rounded-xl border p-4 transition-[box-shadow,transform,background-color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        isDragging
          ? 'border-dashed border-primary/40 bg-primary/5 shadow-none'
          : 'cursor-grab border-border bg-surface shadow-sm hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:cursor-grabbing'
      }`}
    >
      {/* Keep content in the layout while dragging so the column doesn't collapse */}
      <div className={isDragging ? 'invisible' : undefined}>
        <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-muted-foreground">
          #{issue.issueNumber}
        </span>

        <h4 className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-primary">
          {issue.title}
        </h4>

        {labels.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {labels.slice(0, MAX_VISIBLE_LABELS).map((label) => (
              <span
                key={label.id}
                className="max-w-30 truncate rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
              >
                {label.name}
              </span>
            ))}

            {hiddenCount > 0 && (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{hiddenCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default KanbanIssueCard;

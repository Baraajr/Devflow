import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useState } from 'react';

import type { Issue, IssueStatus } from '../../types/issue';
import KanbanColumn from './KanbanColumn';

interface Column {
  id: string;
  title: string;
  issues: Issue[];
}

interface KanbanBoardProps {
  columns: Column[];
  onIssueStatusChange: (
    issueId: string,
    status: IssueStatus,
  ) => void | Promise<void>;
}

interface ActiveSize {
  width: number;
  height: number;
}

// Pointer-based detection is accurate for tall/uneven columns.
// Falls back to rect intersection for keyboard dragging (no pointer).
const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length > 0 ? hits : rectIntersection(args);
};

function KanbanBoard({ columns, onIssueStatusChange }: KanbanBoardProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [activeSize, setActiveSize] = useState<ActiveSize | null>(null);

  const sensors = useSensors(
    // Small movement threshold so clicks on cards still work
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // Keyboard dragging (focus a card, Space to pick up, arrows to move)
    useSensor(KeyboardSensor),
  );

  const clearActive = () => {
    setActiveIssue(null);
    setActiveSize(null);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const issue = columns
      .flatMap((column) => column.issues)
      .find((issue) => issue.id === active.id);

    const rect = active.rect.current.initial;

    setActiveIssue(issue ?? null);
    setActiveSize(rect ? { width: rect.width, height: rect.height } : null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const draggedIssue = activeIssue;
    clearActive();

    if (!over) return;

    // Only accept drops on a real column
    const targetId = String(over.id);
    if (!columns.some((column) => column.id === targetId)) return;

    // Dropped back into its own column: nothing to update
    if (draggedIssue && draggedIssue.status === targetId) return;

    void onIssueStatusChange(String(active.id), targetId as IssueStatus);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragCancel={clearActive}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            issues={column.issues}
            placeholderHeight={
              activeIssue && activeIssue.status !== column.id
                ? (activeSize?.height ?? null)
                : null
            }
          />
        ))}
      </div>

      {/* null: the card is moved optimistically, so don't animate back to the old spot */}
      <DragOverlay dropAnimation={null}>
        {activeIssue ? (
          <div
            className="pointer-events-none relative"
            style={activeSize ? { width: activeSize.width } : undefined}
          >
            <div
              className={`rotate-2 scale-105 cursor-grabbing rounded-xl border border-primary/40 bg-surface p-4 shadow-2xl ring-2 ring-primary/20 ${
                activeSize ? '' : 'w-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                  #{activeIssue.issueNumber}
                </span>

                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              </div>

              <p className="mt-3 line-clamp-2 text-sm font-medium leading-snug text-primary">
                {activeIssue.title}
              </p>
            </div>

            <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-lg">
              Drop to move
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;

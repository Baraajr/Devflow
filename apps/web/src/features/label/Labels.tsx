import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { useDeleteLabel, useProjectLabels } from '../../hooks/useLabels.ts';

import Modal from '../../ui/Modal.tsx';
import ConfirmDialog from '../../ui/ConfirmDialog.tsx';
import { Button } from '../../ui/Button.tsx';

import CreateLabelForm from './CreateLabelForm.tsx';
import UpdateLabelForm from './UpdateLabelForm.tsx';

import type { Label } from '../../types/label.ts';

/* ---------- Page ---------- */

function Labels() {
  const { projectId } = useParams<{ projectId: string }>();

  const {
    data: labels = [],
    isLoading,
    isError,
  } = useProjectLabels(projectId ?? '');

  const deleteLabel = useDeleteLabel(projectId ?? '');

  if (!projectId) {
    return <p className="text-sm text-muted-foreground">Project not found.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/10 via-surface to-surface px-8 py-8 shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-primary">
                Labels
              </h1>

              {!isLoading && !isError && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {labels.length}
                </span>
              )}
            </div>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Manage labels for this project.
            </p>
          </div>

          <Modal.Open opens="create-label">
            <Button>
              <Plus size={18} />
              Create label
            </Button>
          </Modal.Open>
        </div>
      </section>

      <Modal.Window name="create-label">
        <CreateLabelForm projectId={projectId} />
      </Modal.Window>

      {/* List */}
      {isLoading ? (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-5">
              <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-sm font-medium text-red-500">
            Failed to load labels.
          </p>
        </div>
      ) : labels.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Tag className="h-5 w-5" />
          </span>

          <h2 className="mt-4 font-semibold text-primary">No labels yet</h2>

          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Create a label to organize issues in this project.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {labels.map((label) => (
            <LabelRow
              key={label.id}
              projectId={projectId}
              label={label}
              onDelete={() => deleteLabel.mutateAsync(label.id)}
              isDeleting={
                deleteLabel.isPending && deleteLabel.variables === label.id
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Row ---------- */

interface LabelRowProps {
  projectId: string;
  label: Label;
  onDelete: () => Promise<unknown>;
  isDeleting: boolean;
}

function LabelRow({ projectId, label, onDelete, isDeleting }: LabelRowProps) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 transition hover:bg-surface-hover">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: `color-mix(in srgb, ${label.color} 12%, transparent)`,
        }}
      >
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: label.color }}
        />
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-primary">
          {label.name}
        </h3>

        <p className="mt-0.5 font-mono text-xs uppercase text-muted-foreground">
          {label.color}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Modal.Open opens={`edit-label-${label.id}`}>
          <Button variant="ghost" type="button">
            <Pencil className="h-4 w-4" />
          </Button>
        </Modal.Open>

        <Modal.Open opens={`delete-label-${label.id}`}>
          <Button variant="ghost" type="button">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </Modal.Open>

        <Modal.Window name={`edit-label-${label.id}`}>
          <UpdateLabelForm projectId={projectId} label={label} />
        </Modal.Window>

        <Modal.Window name={`delete-label-${label.id}`}>
          <ConfirmDialog
            resourceName={`label "${label.name}"`}
            description="This will remove the label from the project and all issues using it."
            onConfirm={onDelete}
            disabled={isDeleting}
          />
        </Modal.Window>
      </div>
    </div>
  );
}

export default Labels;

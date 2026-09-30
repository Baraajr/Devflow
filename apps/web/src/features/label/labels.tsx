import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { useDeleteLabel, useProjectLabels } from '../../hooks/useLabels.ts';

import Modal from '../../ui/Modal.tsx';
import ConfirmDialog from '../../ui/ConfirmDialog.tsx';
import { Button } from '../../ui/Button.tsx';

import CreateLabelForm from './CreateLabelForm.tsx';
import UpdateLabelForm from './UpdateLabelForm.tsx';

import type { Label } from '../../types/label.ts';

function Labels() {
  const { projectId } = useParams<{ projectId: string }>();

  const {
    data: labels = [],
    isLoading,
    isError,
  } = useProjectLabels(projectId ?? '');

  const deleteLabel = useDeleteLabel(projectId ?? '');

  if (!projectId) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Project not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Labels</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage labels for this project.
          </p>
        </div>

        <Modal.Open opens="create-label">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create label
          </Button>
        </Modal.Open>

        <Modal.Window name="create-label">
          <CreateLabelForm projectId={projectId} />
        </Modal.Window>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          Loading labels...
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-sm text-red-500">
          Failed to load labels.
        </div>
      )}

      {!isLoading && !isError && labels.length === 0 && (
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
          <Tag className="mx-auto h-10 w-10 text-muted-foreground" />

          <h2 className="mt-4 text-lg font-medium text-primary">
            No labels found
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Create a label to organize issues in this project.
          </p>
        </div>
      )}

      {!isLoading && !isError && labels.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="divide-y divide-border">
            {labels.map((label) => (
              <LabelRow
                key={label.id}
                projectId={projectId}
                label={label}
                onDelete={() => deleteLabel.mutateAsync(label.id)}
                isDeleting={deleteLabel.isPending}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface LabelRowProps {
  projectId: string;
  label: Label;
  onDelete: () => Promise<unknown>;
  isDeleting: boolean;
}

function LabelRow({ projectId, label, onDelete, isDeleting }: LabelRowProps) {
  return (
    <div className="flex items-center gap-4 p-4">
      <div
        className="h-4 w-4 shrink-0 rounded-full"
        style={{ backgroundColor: label.color }}
      />

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-primary">{label.name}</h3>

        <p className="mt-1 text-xs text-muted-foreground">{label.color}</p>
      </div>

      <div className="flex items-center gap-2">
        <Modal.Open opens={`edit-label-${label.id}`}>
          <Button variant="ghost">
            <Pencil className=" h-4 w-4" />
          </Button>
        </Modal.Open>

        <Modal.Window name={`edit-label-${label.id}`}>
          <UpdateLabelForm projectId={projectId} label={label} />
        </Modal.Window>

        <Modal.Open opens={`delete-label-${label.id}`}>
          <Button variant="danger-ghost">
            <Trash2 className=" h-4 w-4" />
          </Button>
        </Modal.Open>

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

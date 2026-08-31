import { Button } from './Button';
import Modal from './Modal';

interface ConfirmDialogProps {
  resourceName: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
}

export default function ConfirmDialog({
  resourceName,
  onConfirm,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  disabled = false,
}: ConfirmDialogProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Delete {resourceName}?</h2>

        <p className="text-sm text-muted-foreground">
          This action cannot be undone.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Modal.Close>
          <Button variant="ghost" disabled={disabled}>
            {cancelLabel}
          </Button>
        </Modal.Close>

        <Button variant="danger" onClick={onConfirm} disabled={disabled}>
          {disabled ? 'Deleting...' : confirmLabel}
        </Button>
      </div>
    </div>
  );
}

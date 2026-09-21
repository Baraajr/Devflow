import { Button } from './Button';
import Modal from './Modal';
import { SpinnerMini } from './SpinnerMini';

interface ConfirmDialogProps {
  resourceName?: string;
  title?: string;
  description?: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
}

export default function ConfirmDialog({
  resourceName,
  title,
  description = 'This action cannot be undone.',
  onConfirm,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  disabled = false,
}: ConfirmDialogProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {title ?? `Delete ${resourceName}?`}
        </h2>

        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex justify-end gap-3">
        <Modal.Close>
          <Button variant="ghost" disabled={disabled}>
            {cancelLabel}
          </Button>
        </Modal.Close>

        <Button variant="danger" onClick={onConfirm} loading={disabled}>
          {disabled ? <SpinnerMini /> : confirmLabel}
        </Button>
      </div>
    </div>
  );
}

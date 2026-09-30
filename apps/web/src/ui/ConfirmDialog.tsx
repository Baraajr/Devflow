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

function ConfirmDialog({
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
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-primary">
          {title ?? `Delete ${resourceName}?`}
        </h2>

        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Modal.Close>
          <Button variant="ghost" disabled={disabled}>
            {cancelLabel}
          </Button>
        </Modal.Close>

        <Button variant="danger" onClick={onConfirm} disabled={disabled}>
          {disabled ? <SpinnerMini /> : confirmLabel}
        </Button>
      </div>
    </div>
  );
}

export default ConfirmDialog;

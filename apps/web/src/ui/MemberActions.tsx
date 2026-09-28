import { Trash2, UserCog } from 'lucide-react';
import { Button } from './Button';
import Modal from './Modal';

type MemberActionsProps = {
  changeRoleModal: string;
  removeModal: string;
  onChangeRole: () => void;
  onRemove: () => void;
};

function MemberActions({
  changeRoleModal,
  removeModal,
  onChangeRole,
  onRemove,
}: MemberActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Modal.Open opens={changeRoleModal}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onChangeRole}
          className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
        >
          <UserCog className="h-4 w-4" />
        </Button>
      </Modal.Open>

      <Modal.Open opens={removeModal}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-muted-foreground hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </Modal.Open>
    </div>
  );
}

export default MemberActions;

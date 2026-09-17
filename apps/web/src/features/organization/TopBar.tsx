import { Button } from '../../ui/Button';
import Modal from '../../ui/Modal';
import CreateOrganizationForm from './CreateOrganizationForm';

function TopBar() {
  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold">Organizations</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organizations and teams.
        </p>
      </div>

      <Modal.Open opens="create-organization">
        <Button>Create organization</Button>
      </Modal.Open>

      <Modal.Window name="create-organization">
        <CreateOrganizationForm />
      </Modal.Window>
    </header>
  );
}

export default TopBar;

import { useEffect, useRef, useState } from 'react';

import TabButton from './TabButton';
import InvitationsTab from './InvitationsTab';
import NotificationsTab from './NotificationsTab';

type NotificationTab = 'invitations' | 'notifications';

interface NotificationCenterProps {
  onClose: () => void;
}

function NotificationCenter({ onClose }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<NotificationTab>('notifications');

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        !notificationRef.current?.contains(target)
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={notificationRef}
      className="absolute right-6 top-16 z-50 w-96 overflow-hidden rounded-lg border bg-background shadow-lg"
    >
      <div className="flex border-b">
        <TabButton
          active={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </TabButton>

        <TabButton
          active={activeTab === 'invitations'}
          onClick={() => setActiveTab('invitations')}
        >
          Invitations
        </TabButton>
      </div>

      <div className="max-h-112.5 overflow-y-auto">
        {activeTab === 'notifications' ? (
          <NotificationsTab />
        ) : (
          <InvitationsTab />
        )}
      </div>
    </div>
  );
}

export default NotificationCenter;

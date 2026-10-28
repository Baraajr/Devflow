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
      className="
      fixed left-3 right-3 top-18 z-50
      flex max-h-[calc(100dvh-6rem)] flex-col
      overflow-hidden rounded-xl border
      bg-background shadow-xl
      sm:absolute sm:left-auto sm:right-4 sm:top-16
      sm:w-96
    "
    >
      {/* Tabs */}
      <div className="flex shrink-0 border-b">
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

      {/* Tab content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
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

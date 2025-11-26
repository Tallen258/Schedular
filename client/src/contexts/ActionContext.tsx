import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ActionNotificationPanel from '../components/ActionNotificationPanel';
import type { ActionNotification } from '../components/ActionNotificationPanel';

interface ActionContextType {
  triggerAction: (action: string, message: string, type?: ActionNotification['type'], navigateTo?: string) => void;
  showNotificationPanel: () => void;
  hideNotificationPanel: () => void;
  notifications: ActionNotification[];
}

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export function ActionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ActionNotification[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const triggerAction = useCallback((
    action: string,
    message: string,
    type: ActionNotification['type'] = 'success',
    navigateTo?: string
  ) => {
    const notification: ActionNotification = {
      id: `${Date.now()}-${Math.random()}`,
      action,
      message,
      type,
      timestamp: new Date(),
    };

    setNotifications((prev) => [notification, ...prev].slice(0, 20)); //I want to add these two a database table with a option to delete them 

    const toastMessage = `${action}: ${message}`;
    switch (type) {
      case 'success':
        toast.success(toastMessage);
        break;
      case 'error':
        toast.error(toastMessage);
        break;
      case 'warning':
        toast(toastMessage, { icon: '⚠️' });
        break;
      default:
        toast(toastMessage);
    }

    setIsPanelOpen(true);
    setTimeout(() => {
      setIsPanelOpen(false);
    }, 4000);

    if (navigateTo) {
      setTimeout(() => {
        navigate(navigateTo);
      }, 500); // Small delay for smooth transition
    }
  }, [navigate]);

  const showNotificationPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const hideNotificationPanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  return (
    <ActionContext.Provider
      value={{
        triggerAction,
        showNotificationPanel,
        hideNotificationPanel,
        notifications,
      }}
    >
      {children}
      <ActionNotificationPanel
        notifications={notifications}
        isOpen={isPanelOpen}
        onClose={hideNotificationPanel}
      />
    </ActionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useActionContext = () => {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error('useActionContext must be used within ActionProvider');
  }
  return context;
};

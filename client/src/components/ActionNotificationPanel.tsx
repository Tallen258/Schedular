import { useEffect, useState } from 'react';

export interface ActionNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  action?: string;
  timestamp: Date;
}

interface ActionNotificationPanelProps {
  notifications: ActionNotification[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ActionNotificationPanel({ 
  notifications, 
  isOpen, 
  onClose 
}: ActionNotificationPanelProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300); // Match animation duration
  };

  const getIcon = (type: ActionNotification['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const getColorClasses = (type: ActionNotification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-custom-red-50 border-custom-red-200 text-custom-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-itin-sand-200 z-50 transition-transform duration-300 ease-in-out ${
        isAnimating ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-itin-sand-200 flex items-center justify-between bg-itin-sand-50">
          <h3 className="font-semibold text-itin-sand-800">Recent Actions</h3>
          <button
            onClick={handleClose}
            className="text-itin-sand-600 hover:text-itin-sand-800 transition-colors p-1"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center text-itin-sand-500 mt-8">
              <p>No recent actions</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${getColorClasses(notification.type)} animate-slideIn`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{getIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    {notification.action && (
                      <p className="font-medium text-sm mb-1">{notification.action}</p>
                    )}
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

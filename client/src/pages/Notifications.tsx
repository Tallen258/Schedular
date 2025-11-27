import { useAgenticAction } from '../contexts/AgenticActionContext';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/layout/Card';

const Notifications = () => {
  const { notifications } = useAgenticAction();

  const getIcon = (type: 'success' | 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'success':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-10 h-10 rounded-full bg-custom-red-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-custom-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const groupNotificationsByDate = () => {
    const groups: { [key: string]: typeof notifications } = {};
    
    notifications.forEach(notification => {
      const date = notification.timestamp.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    
    return groups;
  };

  const groupedNotifications = groupNotificationsByDate();

  return (
    <PageContainer>
      <Card>
        <PageHeader title="Session Notifications" />
        
        <div className="mt-6">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-itin-sand-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-itin-sand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-itin-sand-600 text-lg">No notifications yet</p>
              <p className="text-itin-sand-500 text-sm mt-2">
                Your recent actions and updates will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(([date, notifs]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-itin-sand-600 mb-3 sticky top-0 bg-custom-white py-2">
                    {date}
                  </h3>
                  <div className="space-y-3">
                    {notifs.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-4 p-4 rounded-lg border border-itin-sand-100 hover:bg-itin-sand-50 transition-colors animate-slideIn"
                      >
                        {getIcon(notification.type)}
                        
                        <div className="flex-1 min-w-0">
                          {notification.action && (
                            <h4 className="font-semibold text-itin-sand-800 mb-1">
                              {notification.action}
                            </h4>
                          )}
                          <p className="text-sm text-itin-sand-700">
                            {notification.message}
                          </p>
                          <p className="text-xs text-itin-sand-500 mt-2">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="mt-6 pt-6 border-t border-itin-sand-200">
            <p className="text-sm text-itin-sand-500 text-center">
              Showing {notifications.length} recent notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default Notifications;

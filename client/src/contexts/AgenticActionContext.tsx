import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import toast from 'react-hot-toast';

export interface ActionNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  action?: string;
  timestamp: Date;
}

interface AgenticAction {
  trigger: string;
  context: Record<string, unknown>;
  timestamp: Date;
}

interface AgenticRule {
  name: string;
  condition: (action: AgenticAction, appState: AppState) => boolean;
  effects: Array<{
    type: 'navigate' | 'openPanel' | 'suggest' | 'autoExecute';
    payload: unknown;
    delay?: number;
  }>;
}

interface AppState {
  currentPath: string;
  recentActions: AgenticAction[];
  userBehavior: {
    frequentPaths: Map<string, number>;
    actionPatterns: Map<string, string[]>; // action -> likely next actions
  };
}

interface AgenticActionContextType {
  recordAction: (trigger: string, context?: Record<string, unknown>) => void;
  notifications: ActionNotification[];
}

const AgenticActionContext = createContext<AgenticActionContextType | undefined>(undefined);

// Agentic Rules - The "brain" of the system
const agenticRules: AgenticRule[] = [
  {
    name: 'auto-navigate-after-create',
    condition: (action, state) => 
      action.trigger === 'event_created' && 
      state.currentPath === '/create-event',
    effects: [
      { type: 'navigate', payload: '/calendar', delay: 800 }
    ]
  },
  {
    name: 'auto-navigate-after-delete',
    condition: (action, state) => 
      action.trigger === 'event_deleted' && 
      state.currentPath.includes('/event/'),
    effects: [
      { type: 'navigate', payload: '/calendar', delay: 800 }
    ]
  },
  {
    name: 'auto-open-chat-on-error',
    condition: (action) => 
      action.trigger === 'error' && 
      (action.context?.retryCount as number) >= 2,
    effects: [
      { type: 'suggest', payload: { 
        message: 'Having trouble? Ask AI assistant for help?',
        action: '/chat'
      }, delay: 1500 }
    ]
  },
  {
    name: 'smart-dashboard-redirect',
    condition: (action, state) => {
      // If user frequently goes to dashboard after calendar, predict and suggest
      const pattern = state.userBehavior.actionPatterns.get('view_calendar');
      return (
        action.trigger === 'view_calendar' && 
        pattern ? pattern.includes('view_dashboard') : false
      );
    },
    effects: [
      { type: 'suggest', payload: { 
        message: 'View dashboard overview?',
        action: '/dashboard'
      }, delay: 3000 }
    ]
  },
  {
    name: 'auto-collapse-sidebar-on-schedule-view',
    condition: (action) => 
      action.trigger === 'schedule_analyzed',
    effects: []
  }
];

export function AgenticActionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  
  const [notifications, setNotifications] = useState<ActionNotification[]>([]);
  const [recentActions, setRecentActions] = useState<AgenticAction[]>([]);
  const [userBehavior, setUserBehavior] = useState<AppState['userBehavior']>({
    frequentPaths: new Map(),
    actionPatterns: new Map()
  });

  // Learn user behavior patterns
  useEffect(() => {
    setUserBehavior(prev => {
      const newFrequentPaths = new Map(prev.frequentPaths);
      const count = newFrequentPaths.get(location.pathname) || 0;
      newFrequentPaths.set(location.pathname, count + 1);
      return { ...prev, frequentPaths: newFrequentPaths };
    });
  }, [location.pathname]);

  const executeEffect = useCallback((effect: AgenticRule['effects'][0]) => {
    // Only execute AI effects for authenticated users
    if (!auth.isAuthenticated) {
      return;
    }
    
    const delay = effect.delay || 0;
    
    setTimeout(() => {
      switch (effect.type) {
        case 'navigate':
          if (typeof effect.payload === 'string') {
            navigate(effect.payload);
          }
          break;
          
        case 'openPanel':
          // Navigate to notifications page instead of opening panel
          if (effect.payload) {
            navigate('/notifications');
          }
          break;
          
        case 'suggest': {
          const payload = effect.payload as { message: string; action: string };
          toast((t) => (
            <div className="flex items-center gap-3">
              <span>{payload.message}</span>
              <button
                onClick={() => {
                  navigate(payload.action);
                  toast.dismiss(t.id);
                }}
                className="px-3 py-1 bg-itin-sand-600 text-white rounded-lg text-sm hover:bg-itin-sand-700"
              >
                Go
              </button>
            </div>
          ), { duration: 6000 });
          break;
        }
          
        case 'autoExecute':
          // Execute custom logic
          if (typeof effect.payload === 'function') {
            effect.payload();
          }
          break;
      }
    }, delay);
  }, [navigate, auth.isAuthenticated]);

  const recordAction = useCallback((trigger: string, context: Record<string, unknown> = {}) => {
    const action: AgenticAction = {
      trigger,
      context,
      timestamp: new Date()
    };

    // Add to recent actions
    setRecentActions(prev => [action, ...prev].slice(0, 50));

    // Update behavior patterns
    if (recentActions.length > 0) {
      const lastAction = recentActions[0];
      setUserBehavior(prev => {
        const patterns = new Map(prev.actionPatterns);
        const existing = patterns.get(lastAction.trigger) || [];
        if (!existing.includes(trigger)) {
          patterns.set(lastAction.trigger, [...existing, trigger]);
        }
        return { ...prev, actionPatterns: patterns };
      });
    }

    // Build current app state
    const appState: AppState = {
      currentPath: location.pathname,
      recentActions: [action, ...recentActions],
      userBehavior
    };

    // Add notification
    const notification: ActionNotification = {
      id: `${Date.now()}-${Math.random()}`,
      action: (context.actionName as string) || formatTrigger(trigger),
      message: (context.message as string) || 'Action completed',
      type: (context.type as ActionNotification['type']) || 'success',
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev].slice(0, 20));

    // Evaluate agentic rules (only for authenticated users)
    if (auth.isAuthenticated) {
      agenticRules.forEach(rule => {
        if (rule.condition(action, appState)) {
          console.log(`Agentic rule triggered: ${rule.name}`);
          rule.effects.forEach(effect => executeEffect(effect));
        }
      });
    }

    // Show simple toast for important actions
    if (context.type === 'success') {
      toast.success((context.message as string) || 'Action completed');
    } else if (context.type === 'error') {
      toast.error((context.message as string) || 'Action failed');
    }
  }, [location.pathname, recentActions, userBehavior, executeEffect, auth.isAuthenticated]);

  return (
    <AgenticActionContext.Provider
      value={{
        recordAction,
        notifications,
      }}
    >
      {children}
    </AgenticActionContext.Provider>
  );
}

// Exported separately to satisfy react-refresh/only-export-components
// eslint-disable-next-line react-refresh/only-export-components
export const useAgenticAction = () => {
  const context = useContext(AgenticActionContext);
  if (!context) {
    throw new Error('useAgenticAction must be used within AgenticActionProvider');
  }
  return context;
};

function formatTrigger(trigger: string): string {
  return trigger
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

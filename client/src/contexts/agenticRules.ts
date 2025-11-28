import type { AgenticAction, AgenticRule, AppState } from './types';

export const agenticRules: AgenticRule[] = [
  {
    name: 'auto-navigate-after-create',
    condition: (action: AgenticAction, state: AppState) => 
      action.trigger === 'event_created' && 
      state.currentPath === '/create-event',
    effects: [
      { type: 'navigate', payload: '/calendar', delay: 800 }
    ]
  },
  {
    name: 'auto-navigate-after-delete',
    condition: (action: AgenticAction, state: AppState) => 
      action.trigger === 'event_deleted' && 
      state.currentPath.includes('/event/'),
    effects: [
      { type: 'navigate', payload: '/calendar', delay: 800 }
    ]
  },
  {
    name: 'auto-open-chat-on-error',
    condition: (action: AgenticAction) => 
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
    condition: (action: AgenticAction, state: AppState) => {
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
    condition: (action: AgenticAction) => 
      action.trigger === 'schedule_analyzed',
    effects: []
  }
];

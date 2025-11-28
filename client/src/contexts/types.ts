export interface ActionNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  action?: string;
  timestamp: Date;
}

export interface AgenticAction {
  trigger: string;
  context: Record<string, unknown>;
  timestamp: Date;
}

export interface AgenticRule {
  name: string;
  condition: (action: AgenticAction, appState: AppState) => boolean;
  effects: Array<{
    type: 'navigate' | 'openPanel' | 'suggest' | 'autoExecute';
    payload: unknown;
    delay?: number;
  }>;
}

export interface AppState {
  currentPath: string;
  recentActions: AgenticAction[];
  userBehavior: {
    frequentPaths: Map<string, number>;
    actionPatterns: Map<string, string[]>;
  };
}

export interface AgenticActionContextType {
  recordAction: (trigger: string, context?: Record<string, unknown>) => void;
  notifications: ActionNotification[];
}

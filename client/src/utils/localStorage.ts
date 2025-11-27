
export interface UserSettings {
  workStartTime: string; 
  workEndTime: string; 
  defaultEventDuration: number; 
  bufferTime: number; 
  preferredDays: number[]; 
}

export interface ScheduleCompareState {
  selectedDate: string;
  imagePreview: string | null;
  extractedEvents: Array<{
    title: string;
    start_time: string;
    end_time: string;
  }>;
  editableExtractedEvents: Array<{
    title: string;
    start_time: string;
    end_time: string;
  }>;
  commonFreeSlots: Array<{
    start: string;
    end: string;
  }>;
  isConfirmed: boolean;
  excludeAllDayEvents: boolean;
}

const STORAGE_KEYS = {
  USER_SETTINGS: 'schedular_user_settings',
  THEME_PREFERENCE: 'schedular_theme',
  LAST_SYNC: 'schedular_last_sync',
  SCHEDULE_COMPARE: 'schedular_schedule_compare',
  ANONYMOUS_EVENTS: 'schedular_anonymous_events',
} as const;

const DEFAULT_SETTINGS: UserSettings = {
  workStartTime: '09:00',
  workEndTime: '17:00',
  defaultEventDuration: 60,
  bufferTime: 15,
  preferredDays: [1, 2, 3, 4, 5], 
};


export function getUserSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch (error) {
    console.error('Error reading user settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
}


export function saveUserSettings(settings: Partial<UserSettings>): void {
  try {
    const current = getUserSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving user settings to localStorage:', error);
    throw error;
  }
}


export function clearUserSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
  } catch (error) {
    console.error('Error clearing user settings:', error);
  }
}


export function saveLastSyncTime(timestamp: Date = new Date()): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toISOString());
  } catch (error) {
    console.error('Error saving last sync time:', error);
  }
}


export function getLastSyncTime(): Date | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return stored ? new Date(stored) : null;
  } catch (error) {
    console.error('Error reading last sync time:', error);
    return null;
  }
}


export function saveThemePreference(theme: 'light' | 'dark' | 'auto'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, theme);
  } catch (error) {
    console.error('Error saving theme preference:', error);
  }
}


export function getThemePreference(): 'light' | 'dark' | 'auto' {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      return stored;
    }
    return 'auto';
  } catch (error) {
    console.error('Error reading theme preference:', error);
    return 'auto';
  }
}


export function clearAllAppData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing app data:', error);
  }
}

// Schedule Compare State Management
export function getScheduleCompareState(): ScheduleCompareState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SCHEDULE_COMPARE);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading schedule compare state:', error);
    return null;
  }
}

export function saveScheduleCompareState(state: ScheduleCompareState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE_COMPARE, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving schedule compare state:', error);
    throw error;
  }
}

export function clearScheduleCompareState(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE_COMPARE);
  } catch (error) {
    console.error('Error clearing schedule compare state:', error);
  }
}

// Anonymous Events Management
export interface LocalEvent {
  id: number;
  user_email: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  created_at: string;
  updated_at: string;
}

export function getAnonymousEvents(): LocalEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ANONYMOUS_EVENTS);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading anonymous events:', error);
    return [];
  }
}

export function saveAnonymousEvent(event: Omit<LocalEvent, 'id' | 'created_at' | 'updated_at'>): LocalEvent {
  try {
    const events = getAnonymousEvents();
    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    const now = new Date().toISOString();
    const newEvent: LocalEvent = {
      ...event,
      id: newId,
      created_at: now,
      updated_at: now,
    };
    events.push(newEvent);
    localStorage.setItem(STORAGE_KEYS.ANONYMOUS_EVENTS, JSON.stringify(events));
    return newEvent;
  } catch (error) {
    console.error('Error saving anonymous event:', error);
    throw error;
  }
}

export function updateAnonymousEvent(id: number, updates: Partial<LocalEvent>): LocalEvent | null {
  try {
    const events = getAnonymousEvents();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    const updatedEvent = {
      ...events[index],
      ...updates,
      id: events[index].id,
      updated_at: new Date().toISOString(),
    };
    events[index] = updatedEvent;
    localStorage.setItem(STORAGE_KEYS.ANONYMOUS_EVENTS, JSON.stringify(events));
    return updatedEvent;
  } catch (error) {
    console.error('Error updating anonymous event:', error);
    throw error;
  }
}

export function deleteAnonymousEvent(id: number): boolean {
  try {
    const events = getAnonymousEvents();
    const filtered = events.filter(e => e.id !== id);
    if (filtered.length === events.length) return false;
    localStorage.setItem(STORAGE_KEYS.ANONYMOUS_EVENTS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting anonymous event:', error);
    return false;
  }
}

export function clearAnonymousEvents(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ANONYMOUS_EVENTS);
  } catch (error) {
    console.error('Error clearing anonymous events:', error);
  }
}

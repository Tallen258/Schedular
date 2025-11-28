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
  extractedEvents: Array<{ title: string; start_time: string; end_time: string; }>;
  editableExtractedEvents: Array<{ title: string; start_time: string; end_time: string; }>;
  commonFreeSlots: Array<{ start: string; end: string; }>;
  isConfirmed: boolean;
  excludeAllDayEvents: boolean;
}

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

// Generic helpers
const getItem = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const setItem = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to ${key}:`, error);
    throw error;
  }
};

const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing ${key}:`, error);
  }
};

// User Settings
export const getUserSettings = (): UserSettings => 
  getItem(STORAGE_KEYS.USER_SETTINGS, DEFAULT_SETTINGS);

export const saveUserSettings = (settings: Partial<UserSettings>): void =>
  setItem(STORAGE_KEYS.USER_SETTINGS, { ...getUserSettings(), ...settings });

export const clearUserSettings = (): void => removeItem(STORAGE_KEYS.USER_SETTINGS);

// Sync Time
export const saveLastSyncTime = (timestamp: Date = new Date()): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toISOString());
  } catch (error) {
    console.error('Error saving last sync time:', error);
  }
};

export const getLastSyncTime = (): Date | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return stored ? new Date(stored) : null;
  } catch {
    return null;
  }
};

// Theme
export const saveThemePreference = (theme: 'light' | 'dark' | 'auto'): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, theme);
  } catch (error) {
    console.error('Error saving theme preference:', error);
  }
};

export const getThemePreference = (): 'light' | 'dark' | 'auto' => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
    return (stored === 'light' || stored === 'dark' || stored === 'auto') ? stored : 'auto';
  } catch {
    return 'auto';
  }
};

// Schedule Compare
export const getScheduleCompareState = (): ScheduleCompareState | null =>
  getItem(STORAGE_KEYS.SCHEDULE_COMPARE, null);

export const saveScheduleCompareState = (state: ScheduleCompareState): void =>
  setItem(STORAGE_KEYS.SCHEDULE_COMPARE, state);

export const clearScheduleCompareState = (): void => removeItem(STORAGE_KEYS.SCHEDULE_COMPARE);

// Anonymous Events
export const getAnonymousEvents = (): LocalEvent[] =>
  getItem(STORAGE_KEYS.ANONYMOUS_EVENTS, []);

export const saveAnonymousEvent = (event: Omit<LocalEvent, 'id' | 'created_at' | 'updated_at'>): LocalEvent => {
  const events = getAnonymousEvents();
  const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
  const now = new Date().toISOString();
  const newEvent: LocalEvent = { ...event, id: newId, created_at: now, updated_at: now };
  setItem(STORAGE_KEYS.ANONYMOUS_EVENTS, [...events, newEvent]);
  return newEvent;
};

export const updateAnonymousEvent = (id: number, updates: Partial<LocalEvent>): LocalEvent | null => {
  const events = getAnonymousEvents();
  const index = events.findIndex(e => e.id === id);
  if (index === -1) return null;
  const updatedEvent = { ...events[index], ...updates, id: events[index].id, updated_at: new Date().toISOString() };
  events[index] = updatedEvent;
  setItem(STORAGE_KEYS.ANONYMOUS_EVENTS, events);
  return updatedEvent;
};

export const deleteAnonymousEvent = (id: number): boolean => {
  const events = getAnonymousEvents();
  const filtered = events.filter(e => e.id !== id);
  if (filtered.length === events.length) return false;
  setItem(STORAGE_KEYS.ANONYMOUS_EVENTS, filtered);
  return true;
};

export const clearAnonymousEvents = (): void => removeItem(STORAGE_KEYS.ANONYMOUS_EVENTS);

// Clear All
export const clearAllAppData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing app data:', error);
  }
};
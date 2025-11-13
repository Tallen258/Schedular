
export interface UserSettings {
  workStartTime: string; 
  workEndTime: string; 
  defaultEventDuration: number; 
  bufferTime: number; 
  preferredDays: number[]; 
}

const STORAGE_KEYS = {
  USER_SETTINGS: 'schedular_user_settings',
  THEME_PREFERENCE: 'schedular_theme',
  LAST_SYNC: 'schedular_last_sync',
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

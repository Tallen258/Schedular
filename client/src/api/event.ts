import api from '../services/api';
import { 
  getAnonymousEvents, 
  saveAnonymousEvent, 
  updateAnonymousEvent, 
  deleteAnonymousEvent,
  type LocalEvent 
} from '../utils/localStorage';

// Helper to check if user is authenticated
const isAuthenticated = (): boolean => {
  const oidcStorageKey = `oidc.user:https://auth-dev.snowse.io/realms/DevRealm:taft-chat`;
  const oidcStorage = localStorage.getItem(oidcStorageKey);
  if (!oidcStorage) return false;
  try {
    const user = JSON.parse(oidcStorage);
    return !!user?.access_token;
  } catch {
    return false;
  }
};

export interface Event {
  id: number;
  user_email: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string; // ISO 8601 datetime string
  end_time: string;   // ISO 8601 datetime string
  all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  start_time: string; // ISO 8601 datetime string
  end_time: string;   // ISO 8601 datetime string
  all_day?: boolean;
}

export interface UpdateEventInput {
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
}

export interface EventsResponse {
  events: Event[];
}

export interface EventResponse {
  event: Event;
}

export interface DeleteEventResponse {
  success: boolean;
  message: string;
}


export const getEvents = async (): Promise<Event[]> => {
  console.log('[getEvents] Checking authentication...');
  const authenticated = isAuthenticated();
  console.log('[getEvents] Is authenticated:', authenticated);
  
  // For anonymous users, return localStorage events
  if (!authenticated) {
    const localEvents = getAnonymousEvents();
    console.log('[getEvents] Returning localStorage events:', localEvents);
    return localEvents;
  }
  
  // For authenticated users, fetch from API
  console.log('[getEvents] Fetching from API...');
  const response = await api.get<EventsResponse>('/api/events');
  console.log('[getEvents] API response:', response.data);
  return response.data.events;
};


export const getEventById = async (id: number): Promise<Event> => {
  // For anonymous users, get from localStorage
  if (!isAuthenticated()) {
    const events = getAnonymousEvents();
    const event = events.find(e => e.id === id);
    if (!event) throw new Error('Event not found');
    return event;
  }
  
  // For authenticated users, fetch from API
  const response = await api.get<EventResponse>(`/api/events/${id}`);
  return response.data.event;
};


export const createEvent = async (input: CreateEventInput): Promise<Event> => {
  console.log('[createEvent] Input:', input);
  console.log('[createEvent] Checking authentication...');
  const authenticated = isAuthenticated();
  console.log('[createEvent] Is authenticated:', authenticated);
  
  // For anonymous users, save to localStorage
  if (!authenticated) {
    const newEvent = saveAnonymousEvent({
      user_email: 'anonymous',
      title: input.title,
      description: input.description || null,
      location: input.location || null,
      start_time: input.start_time,
      end_time: input.end_time,
      all_day: input.all_day || false,
    });
    console.log('[createEvent] Saved to localStorage:', newEvent);
    return newEvent;
  }
  
  // For authenticated users, post to API
  console.log('[createEvent] Posting to API...');
  const response = await api.post<EventResponse>('/api/events', input);
  console.log('[createEvent] API response:', response.data);
  return response.data.event;
};


export const updateEvent = async (id: number, input: UpdateEventInput): Promise<Event> => {
  // For anonymous users, update in localStorage
  if (!isAuthenticated()) {
    const updated = updateAnonymousEvent(id, {
      title: input.title,
      description: input.description || null,
      location: input.location || null,
      start_time: input.start_time,
      end_time: input.end_time,
      all_day: input.all_day || false,
    });
    if (!updated) throw new Error('Event not found');
    return updated;
  }
  
  // For authenticated users, put to API
  const response = await api.put<EventResponse>(`/api/events/${id}`, input);
  return response.data.event;
};


export const deleteEvent = async (id: number): Promise<void> => {
  // For anonymous users, delete from localStorage
  if (!isAuthenticated()) {
    const success = deleteAnonymousEvent(id);
    if (!success) throw new Error('Event not found');
    return;
  }
  
  // For authenticated users, delete via API
  await api.delete<DeleteEventResponse>(`/api/events/${id}`);
};


export const getEventsByDateRange = async (startDate: Date, endDate: Date): Promise<Event[]> => {
  const allEvents = await getEvents();
  
  return allEvents.filter(event => {
    const eventStart = new Date(event.start_time);
    return eventStart >= startDate && eventStart <= endDate;
  });
};


export const getUpcomingEvents = async (limit?: number): Promise<Event[]> => {
  const allEvents = await getEvents();
  const now = new Date();
  
  const upcomingEvents = allEvents
    .filter(event => new Date(event.start_time) >= now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  
  return limit ? upcomingEvents.slice(0, limit) : upcomingEvents;
};


export const getTodaysEvents = async (): Promise<Event[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getEventsByDateRange(today, tomorrow);
};


export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: string | null;
  end: string | null;
  location: string | null;
  attendees: { email: string; responseStatus?: string }[];
  hangoutLink: string | null;
}

export interface GoogleCalendarResponse {
  items: GoogleCalendarEvent[];
}


export const startGoogleCalendarAuth = async (): Promise<{ url: string }> => {
  const response = await api.post<{ url: string }>('/api/auth/google/start', {});
  return response.data;
};


export const getGoogleCalendarEvents = async (): Promise<GoogleCalendarEvent[]> => {
  const response = await api.get<GoogleCalendarResponse>('/api/google/calendar/upcoming');
  return response.data.items ?? [];
};


export const syncGoogleCalendarEvents = async (): Promise<{
  success: boolean;
  imported: number;
  skipped: number;
  total: number;
  events: Event[];
}> => {
  const response = await api.post<{
    success: boolean;
    imported: number;
    skipped: number;
    total: number;
    events: Event[];
  }>('/api/google/calendar/sync', {});
  return response.data;
};


export const importGoogleCalendarEvent = async (eventId: string): Promise<{
  success: boolean;
  event: Event;
  action: 'created' | 'updated';
}> => {
  const response = await api.post<{
    success: boolean;
    event: Event;
    action: 'created' | 'updated';
  }>(`/api/google/calendar/import/${eventId}`, {});
  return response.data;
};


export const eventApi = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByDateRange,
  getUpcomingEvents,
  getTodaysEvents,
  // Google Calendar functions
  startGoogleCalendarAuth,
  getGoogleCalendarEvents,
  syncGoogleCalendarEvents,
  importGoogleCalendarEvent,
};

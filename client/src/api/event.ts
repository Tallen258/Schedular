import api from '../services/api';
import { 
  getAnonymousEvents, 
  saveAnonymousEvent, 
  updateAnonymousEvent, 
  deleteAnonymousEvent,
} from '../utils/localStorage';

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
  start_time: string;
  end_time: string;
  all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
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
  if (!isAuthenticated()) {
    return getAnonymousEvents();
  }
  const response = await api.get<EventsResponse>('/api/events');
  return response.data.events;
};

export const getEventById = async (id: number): Promise<Event> => {
  if (!isAuthenticated()) {
    const events = getAnonymousEvents();
    const event = events.find(e => e.id === id);
    if (!event) throw new Error('Event not found');
    return event;
  }
  const response = await api.get<EventResponse>(`/api/events/${id}`);
  return response.data.event;
};

export const createEvent = async (input: CreateEventInput): Promise<Event> => {
  if (!isAuthenticated()) {
    return saveAnonymousEvent({
      user_email: 'anonymous',
      title: input.title,
      description: input.description || null,
      location: input.location || null,
      start_time: input.start_time,
      end_time: input.end_time,
      all_day: input.all_day || false,
    });
  }
  const response = await api.post<EventResponse>('/api/events', input);
  return response.data.event;
};

export const updateEvent = async (id: number, input: UpdateEventInput): Promise<Event> => {
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
  const response = await api.put<EventResponse>(`/api/events/${id}`, input);
  return response.data.event;
};

export const deleteEvent = async (id: number): Promise<void> => {
  if (!isAuthenticated()) {
    const success = deleteAnonymousEvent(id);
    if (!success) throw new Error('Event not found');
    return;
  }
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingEvents = allEvents
    .filter(event => new Date(event.start_time) >= today)
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

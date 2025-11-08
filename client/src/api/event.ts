import api from '../services/api';

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get all events for the authenticated user
 */
export const getEvents = async (): Promise<Event[]> => {
  const response = await api.get<EventsResponse>('/api/events');
  return response.data.events;
};

/**
 * Get a single event by ID
 */
export const getEventById = async (id: number): Promise<Event> => {
  const response = await api.get<EventResponse>(`/api/events/${id}`);
  return response.data.event;
};

/**
 * Create a new event
 */
export const createEvent = async (input: CreateEventInput): Promise<Event> => {
  const response = await api.post<EventResponse>('/api/events', input);
  return response.data.event;
};

/**
 * Update an existing event
 */
export const updateEvent = async (id: number, input: UpdateEventInput): Promise<Event> => {
  const response = await api.put<EventResponse>(`/api/events/${id}`, input);
  return response.data.event;
};

/**
 * Delete an event
 */
export const deleteEvent = async (id: number): Promise<void> => {
  await api.delete<DeleteEventResponse>(`/api/events/${id}`);
};

/**
 * Get events within a date range
 */
export const getEventsByDateRange = async (startDate: Date, endDate: Date): Promise<Event[]> => {
  const allEvents = await getEvents();
  
  // Filter events by date range
  return allEvents.filter(event => {
    const eventStart = new Date(event.start_time);
    return eventStart >= startDate && eventStart <= endDate;
  });
};

/**
 * Get upcoming events (from now onwards)
 */
export const getUpcomingEvents = async (limit?: number): Promise<Event[]> => {
  const allEvents = await getEvents();
  const now = new Date();
  
  // Filter future events and sort by start time
  const upcomingEvents = allEvents
    .filter(event => new Date(event.start_time) >= now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  
  return limit ? upcomingEvents.slice(0, limit) : upcomingEvents;
};

/**
 * Get events for today
 */
export const getTodaysEvents = async (): Promise<Event[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return getEventsByDateRange(today, tomorrow);
};

// ============================================================================
// Google Calendar API Functions
// ============================================================================

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

/**
 * Start Google Calendar OAuth flow
 */
export const startGoogleCalendarAuth = async (): Promise<{ url: string }> => {
  const response = await api.post<{ url: string }>('/api/auth/google/start', {});
  return response.data;
};

/**
 * Get upcoming Google Calendar events
 */
export const getGoogleCalendarEvents = async (): Promise<GoogleCalendarEvent[]> => {
  const response = await api.get<GoogleCalendarResponse>('/api/google/calendar/upcoming');
  return response.data.items ?? [];
};

/**
 * Sync Google Calendar events to local database
 */
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

/**
 * Import a single Google Calendar event to local database
 */
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

// ============================================================================
// Export all
// ============================================================================

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

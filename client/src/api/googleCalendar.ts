import api from '../services/api';
import type { Event } from './event';

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

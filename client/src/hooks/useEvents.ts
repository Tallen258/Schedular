import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getTodaysEvents,
  type CreateEventInput,
  type UpdateEventInput,
} from '../api/event';

// ============================================================================
// Query Keys
// ============================================================================

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: number) => [...eventKeys.details(), id] as const,
  upcoming: () => [...eventKeys.all, 'upcoming'] as const,
  today: () => [...eventKeys.all, 'today'] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all events
 */
export const useEvents = () => {
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: getEvents,
  });
};

/**
 * Get a single event by ID
 */
export const useEvent = (id: number) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => getEventById(id),
    enabled: !!id, // Only run query if id exists
  });
};

/**
 * Get upcoming events
 */
export const useUpcomingEvents = (limit?: number) => {
  return useQuery({
    queryKey: [...eventKeys.upcoming(), limit],
    queryFn: () => getUpcomingEvents(limit),
  });
};

/**
 * Get today's events
 */
export const useTodaysEvents = () => {
  return useQuery({
    queryKey: eventKeys.today(),
    queryFn: getTodaysEvents,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new event
 */
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: (newEvent) => {
      // Invalidate and refetch events
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      
      toast.success(`Event "${newEvent.title}" created successfully!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });
};

/**
 * Update an existing event
 */
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateEventInput }) =>
      updateEvent(id, input),
    onSuccess: (updatedEvent) => {
      // Invalidate all event queries
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      
      // Update the specific event in cache
      queryClient.setQueryData(eventKeys.detail(updatedEvent.id), updatedEvent);
      
      toast.success(`Event "${updatedEvent.title}" updated successfully!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });
};

/**
 * Delete an event
 */
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteEvent(id),
    onSuccess: (_, deletedId) => {
      // Invalidate all event queries
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      
      // Remove the specific event from cache
      queryClient.removeQueries({ queryKey: eventKeys.detail(deletedId) });
      
      toast.success('Event deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });
};

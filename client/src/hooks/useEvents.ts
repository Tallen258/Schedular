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


export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: number) => [...eventKeys.details(), id] as const,
  upcoming: () => [...eventKeys.all, 'upcoming'] as const,
  today: () => [...eventKeys.all, 'today'] as const,
};


export const useEvents = () => {
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: getEvents,
  });
};


export const useEvent = (id: number) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => getEventById(id),
    enabled: !!id, 
  });
};


export const useUpcomingEvents = (limit?: number) => {
  return useQuery({
    queryKey: [...eventKeys.upcoming(), limit],
    queryFn: () => getUpcomingEvents(limit),
  });
};

export const useTodaysEvents = () => {
  return useQuery({
    queryKey: eventKeys.today(),
    queryFn: getTodaysEvents,
  });
};


export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      
      toast.success(`Event "${newEvent.title}" created successfully!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });
};


export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateEventInput }) =>
      updateEvent(id, input),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      
      queryClient.setQueryData(eventKeys.detail(updatedEvent.id), updatedEvent);
      
      toast.success(`Event "${updatedEvent.title}" updated successfully!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteEvent(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      
      queryClient.removeQueries({ queryKey: eventKeys.detail(deletedId) });
      
      toast.success('Event deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });
};

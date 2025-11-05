import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { apiService } from './api';

// Hook for checking API health
export const useHealthCheck = (): UseQueryResult<{ ok: boolean; time: string }, Error> => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiService.checkHealth();
      return response.data;
    },
  });
};

// Hook for getting user info
export const useWhoAmI = (): UseQueryResult<{
  sub: string | null;
  email: string | null;
  name: string | null;
  roles: string[];
}, Error> => {
  return useQuery({
    queryKey: ['whoami'],
    queryFn: async () => {
      const response = await apiService.getWhoAmI();
      return response.data;
    },
  });
};

// Add more custom hooks here as needed for your application
// Example:
// export const useCreateEvent = (): UseMutationResult<Event, Error, EventData> => {
//   return useMutation({
//     mutationFn: async (data) => {
//       const response = await apiService.createEvent(data);
//       return response.data;
//     },
//   });
// };
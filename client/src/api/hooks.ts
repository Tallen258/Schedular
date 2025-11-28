import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { apiService } from './client';

export const useHealthCheck = (): UseQueryResult<{ ok: boolean; time: string }, Error> => {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiService.checkHealth();
      return response.data;
    },
  });
};

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

// src/hooks/useAdminMetrics.ts
import { useQuery } from '@tanstack/react-query';
import { fetchAdminMetrics } from '../api/client';

export const useAdminMetrics = (period?: '24h' | '7d' | '30d' | '90d' | 'all') => {
    return useQuery({
        queryKey: ['admin-metrics', period],
        queryFn: () => fetchAdminMetrics(period),
    });
};

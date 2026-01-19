import { useQuery } from '@tanstack/react-query';
import { client } from '../api/client';
import type { ExploreContextResponse } from '../types';

export function useExploreContext() {
    return useQuery<ExploreContextResponse>({
        queryKey: ['explore-context'],
        queryFn: async () => {
            console.log('📡 [API] Fetching Explore Context...');
            try {
                const response = await client.get('/mobile/explore-context');
                console.log('✅ [API] Explore Context Success:', response.status);
                return response.data;
            } catch (error: any) {
                console.error('❌ [API] Error fetching Explore Context:', error.message, error.response?.status, error.response?.data);
                throw error;
            }
        },
    });
}

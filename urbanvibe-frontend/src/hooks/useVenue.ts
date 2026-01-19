import { useQuery } from '@tanstack/react-query';
import { client } from '../api/client';
import type { Venue } from '../types';

export async function fetchVenueById(id: string): Promise<Venue> {
    if (!id) throw new Error('Venue ID required');
    // Adjust endpoint specific to public/user access if distinct from admin
    // Assuming /venues/{id} is publicly accessible for basic details
    const response = await client.get(`/venues/${id}`);
    return response.data;
}

export function useVenue(id: string | null | undefined) {
    return useQuery<Venue>({
        queryKey: ['venue', id],
        queryFn: () => fetchVenueById(id!),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

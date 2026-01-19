import { useQuery } from '@tanstack/react-query';
import { client } from '../api/client';
import type { VenueDetailBFFResponse } from '../types';

export function useVenueDetails(venueId: string | undefined) {
    return useQuery<VenueDetailBFFResponse>({
        queryKey: ['venue-details', venueId],
        queryFn: async () => {
            if (!venueId) throw new Error("Venue ID required");
            const response = await client.get(`/mobile/venue-details/${venueId}`);
            return response.data;
        },
        enabled: !!venueId,
    });
}

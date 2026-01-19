import { useQuery } from '@tanstack/react-query';
import { generateCheckInQR } from '../api/client';

export function useVenueQR(venueId: string | null) {
    return useQuery({
        queryKey: ['venue-qr', venueId],
        queryFn: () => generateCheckInQR(venueId!),
        enabled: !!venueId,
        refetchInterval: 1000 * 100, // Refresh every 100 seconds (TTL is 120s)
        refetchOnWindowFocus: true,
    });
}

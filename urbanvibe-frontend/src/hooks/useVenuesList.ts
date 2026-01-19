import { useQuery } from '@tanstack/react-query';
import { client } from '../api/client';
import type { VenueListItemBFF } from '../types';

async function fetchVenuesList(skip = 0, limit = 50): Promise<VenueListItemBFF[]> {
  const res = await client.get('/mobile/venues-list', {
    params: { skip, limit },
  });

  if (Array.isArray(res.data)) {
    return res.data;
  }

  console.warn('⚠️ Respuesta inesperada desde /mobile/venues-list, retornando array vacío.');
  return [];
}

/**
 * Hook para la pantalla de lista de locales.
 * Usa el endpoint optimizado /mobile/venues-list (BFF).
 */
export function useVenuesList(skip = 0, limit = 50) {
  return useQuery<VenueListItemBFF[]>({
    queryKey: ['venues-list-bff', { skip, limit }],
    queryFn: () => fetchVenuesList(skip, limit),
    staleTime: 30_000,
  });
}

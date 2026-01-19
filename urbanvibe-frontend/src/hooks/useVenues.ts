// src/hooks/useVenues.ts

import { useQuery } from '@tanstack/react-query';
import { client } from '../api/client';
import type { Venue } from '../types';

async function fetchVenuesForMap(): Promise<Venue[]> {
  const response = await client.get('/venues/map');

  // El backend ya devuelve un array plano de venues
  const data = response.data;

  if (!Array.isArray(data)) {
    // Defensa mínima por si algún día cambia la forma
    throw new Error('Respuesta inesperada del backend en /venues/map');
  }

  return data;
}

/**
 * Hook principal para el mapa de UrbanVibe.
 * Usa el endpoint optimizado /venues/map.
 */
export function useVenues() {
  return useQuery<Venue[]>({
    queryKey: ['venues', 'map'],
    queryFn: fetchVenuesForMap,
    staleTime: 1000 * 30, // 30s de cache estática
  });
}

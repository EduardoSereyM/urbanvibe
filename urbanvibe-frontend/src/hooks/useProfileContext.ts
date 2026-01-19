
import { useQuery } from '@tanstack/react-query';
import { client } from '../api/client';
import type { ProfileContextBFFResponse } from '../types';

async function fetchProfileContext(): Promise<ProfileContextBFFResponse> {
    const res = await client.get('/mobile/profile-context');
    return res.data;
}

/**
 * Hook BFF para el Perfil.
 * Trae: Perfil, Check-ins recientes y Resumen de Billetera.
 */
export function useProfileContext() {
    return useQuery<ProfileContextBFFResponse>({
        queryKey: ['profile-context'],
        queryFn: fetchProfileContext,
        staleTime: 60 * 1000,
    });
}

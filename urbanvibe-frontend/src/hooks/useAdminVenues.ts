// src/hooks/useAdminVenues.ts
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createAdminVenue,
    fetchAdminVenueDetail,
    fetchAdminVenueDetailById,
    fetchAdminVenuesList,
    fetchMyAdminVenues,
    fetchVenueCheckins,
    updateAdminVenue,
    updateVenue,
    confirmCheckin,
} from '../api/client';
import {
    AdminVenuesFilters,
    AdminVenueUpdatePayload,
    MyVenuesResponse,
    VenueB2BDetail,
    VenueCheckinListResponse,
    VenueCreatePayload,
} from '../api/types';

export function useMyAdminVenues() {
    return useQuery<MyVenuesResponse>({
        queryKey: ['venues-admin', 'me'],
        queryFn: fetchMyAdminVenues,
    });
}

export function useAdminVenueDetail(venueId: string) {
    return useQuery<VenueB2BDetail>({
        queryKey: ['venues-admin', 'detail', venueId],
        queryFn: () => fetchAdminVenueDetail(venueId),
        enabled: !!venueId,
    });
}

export function useCreateVenue() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: VenueCreatePayload) => createAdminVenue(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['venues-admin', 'me'] });
        },
    });
}

export function useUpdateVenue() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ venueId, payload }: { venueId: string; payload: VenueCreatePayload }) =>
            updateVenue(venueId, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['venues-admin', 'detail', variables.venueId] });
            queryClient.invalidateQueries({ queryKey: ['venues-admin', 'me'] });
        },
    });
}

export function useVenueCheckins(venueId: string) {
    return useQuery<VenueCheckinListResponse>({
        queryKey: ['venues-admin', 'checkins', venueId],
        queryFn: () => fetchVenueCheckins(venueId),
        enabled: !!venueId,
        refetchInterval: 5000, // Poll every 5 seconds for real-time updates
    });
}

export function useConfirmCheckin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ venueId, checkinId }: { venueId: string; checkinId: number }) =>
            confirmCheckin(venueId, checkinId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['venues-admin', 'checkins', variables.venueId] });
        },
    });
}

// ============================================================================
// Admin Hooks - SUPER_ADMIN Only
// ============================================================================

/**
 * Hook para obtener la lista de TODOS los locales (SUPER_ADMIN only)
 */
export function useAdminVenuesList(filters?: AdminVenuesFilters) {
    return useQuery({
        queryKey: ['admin', 'venues', 'list', filters],
        queryFn: () => fetchAdminVenuesList(filters),
        staleTime: 60_000, // 1 minuto
        placeholderData: keepPreviousData,
    });
}

/**
 * Hook para obtener el detalle completo de un local como admin (SUPER_ADMIN only)
 */
export function useAdminVenueDetailById(venueId: string) {
    return useQuery({
        queryKey: ['admin', 'venues', 'detail', venueId],
        queryFn: () => fetchAdminVenueDetailById(venueId),
        enabled: !!venueId,
        staleTime: 60_000, // 1 minuto
    });
}

export const useUpdateAdminVenue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ venueId, payload }: { venueId: string; payload: AdminVenueUpdatePayload }) =>
            updateAdminVenue(venueId, payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'venues', 'list'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'venues', 'detail', variables.venueId] });
        },
    });
};

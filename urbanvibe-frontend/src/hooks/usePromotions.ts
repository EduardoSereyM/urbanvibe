import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchVenuePromotions, createPromotion, fetchVenuePointsLogs, validateRewardQR, fetchVenuePromotionsUser, claimPromotion, fetchMyWallet } from '../api/client';
import { Promotion } from '../api/types';

export function useVenuePromotions(venueId: string) {
    return useQuery({
        queryKey: ['venue-promotions', venueId],
        queryFn: () => fetchVenuePromotions(venueId),
        enabled: !!venueId,
    });
}

export function useCreatePromotion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ venueId, payload }: { venueId: string; payload: Partial<Promotion> }) =>
            createPromotion(venueId, payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['venue-promotions', variables.venueId] });
        },
    });
}

export function useVenuePointsLogs(venueId: string) {
    return useQuery({
        queryKey: ['venue-points-logs', venueId],
        queryFn: () => fetchVenuePointsLogs(venueId),
        enabled: !!venueId,
    });
}

export function useValidateReward() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ venueId, qrContent }: { venueId: string; qrContent: string }) =>
            validateRewardQR(venueId, qrContent),
        onSuccess: (data, variables) => {
            // Invalidate points logs to show earned points
            queryClient.invalidateQueries({ queryKey: ['venue-points-logs', variables.venueId] });
            // Also invalidate venue detail to update balance
            queryClient.invalidateQueries({ queryKey: ['admin', 'venues', 'detail', variables.venueId] });
        }
    });
}

// ============================================================================
// User Hooks
// ============================================================================

export function useVenuePromotionsUser(venueId: string) {
    return useQuery({
        queryKey: ['venue-promotions-user', venueId],
        queryFn: () => fetchVenuePromotionsUser(venueId),
        enabled: !!venueId,
    });
}

export function useClaimPromotion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (promotionId: string) => claimPromotion(promotionId),
        onSuccess: () => {
            // Invalidate wallet and user points (profile)
            queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
    });
}

export function useMyWallet() {
    return useQuery({
        queryKey: ['my-wallet'],
        queryFn: fetchMyWallet,
    });
}

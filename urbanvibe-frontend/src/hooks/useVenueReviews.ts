import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchVenueReviews, replyToReview, reportReview, reactToReview } from '../api/client';
import { Review } from '../api/types';

export function useVenueReviews(venueId: string) {
    return useQuery({
        queryKey: ['venue-reviews', venueId],
        queryFn: () => fetchVenueReviews(venueId),
        enabled: !!venueId,
    });
}

export function useReplyToReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ venueId, reviewId, response }: { venueId: string; reviewId: string; response: string }) =>
            replyToReview(venueId, reviewId, response),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['venue-reviews', variables.venueId] });
        },
    });
}

export function useReportReview() {
    return useMutation({
        mutationFn: ({ reviewId, reason, details }: { reviewId: string; reason: string; details?: string }) =>
            reportReview(reviewId, reason, details),
    });
}

export function useReactToReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ reviewId, reactionType }: { reviewId: string; reactionType?: string }) =>
            reactToReview(reviewId, reactionType),
        onSuccess: (data, variables) => {
            // We can optimistically update or invalidate. Invalidating is safer for now.
            // We need venueId to invalidate the specific list. 
            // Ideally the hook caller handles invalidation or we pass venueId.
            queryClient.invalidateQueries({ queryKey: ['venue-reviews'] });
        }
    });
}

export function useMarkReviewsAsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ venueId }: { venueId: string }) => import('../api/client').then(mod => mod.markReviewsAsRead(venueId)),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-venue-detail', variables.venueId] });
        }
    });
}

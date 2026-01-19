import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client } from '../api/client';
import type { Venue } from '../types';

export function useMyFavorites() {
    return useQuery<string[]>({
        queryKey: ['favorites', 'me'],
        queryFn: async () => {
            const response = await client.get('/profiles/me/favorites');
            return response.data; // Expecting list of UUIDs
        },
    });
}

import type { VenueFavoriteItem } from '../types';

export function useHydratedFavorites() {
    return useQuery<VenueFavoriteItem[]>({
        queryKey: ['favorites-hydrated'],
        queryFn: async () => {
            const response = await client.get('/mobile/favorites');
            return response.data;
        },
    });
}

export function useToggleFavoriteVenue() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ venueId, isFavorite }: { venueId: string; isFavorite: boolean }) => {
            if (isFavorite) {
                // Remove
                await client.delete(`/profiles/me/favorites/${venueId}`);
            } else {
                // Add
                await client.post(`/profiles/me/favorites/${venueId}`);
            }
        },
        onMutate: async ({ venueId, isFavorite }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['favorites', 'me'] });
            await queryClient.cancelQueries({ queryKey: ['venue', venueId] });

            // Snapshot the previous value
            const previousFavorites = queryClient.getQueryData<string[]>(['favorites', 'me']);
            const previousVenue = queryClient.getQueryData<Venue>(['venue', venueId]);

            // Optimistically update Favorites List
            queryClient.setQueryData<string[]>(['favorites', 'me'], (old) => {
                const currentList = old || [];
                if (isFavorite) {
                    return currentList.filter(id => id !== venueId);
                } else {
                    return [...currentList, venueId];
                }
            });

            // Optimistically update Venue Count
            if (previousVenue) {
                queryClient.setQueryData<Venue>(['venue', venueId], (old) => {
                    if (!old) return old;
                    const newCount = (old.favorites_count || 0) + (isFavorite ? -1 : 1);
                    return {
                        ...old,
                        favorites_count: Math.max(0, newCount)
                    };
                });
            }

            // Return context
            return { previousFavorites, previousVenue };
        },
        onError: (err, newTodo, context) => {
            // Rollback
            if (context?.previousFavorites) {
                queryClient.setQueryData(['favorites', 'me'], context.previousFavorites);
            }
            if (context?.previousVenue) {
                queryClient.setQueryData(['venue', newTodo.venueId], context.previousVenue);
            }
        },
        onSettled: (data, error, variables) => {
            // Always refetch
            queryClient.invalidateQueries({ queryKey: ['favorites', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['venue', variables.venueId] });
        },
    });
}

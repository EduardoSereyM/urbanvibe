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
            await queryClient.cancelQueries({ queryKey: ['favorites-hydrated'] });
            await queryClient.cancelQueries({ queryKey: ['venue', venueId] });
            await queryClient.cancelQueries({ queryKey: ['venue-details', venueId] });
            await queryClient.cancelQueries({ queryKey: ['explore-context'] });
            await queryClient.cancelQueries({ queryKey: ['venues-list-bff'] });

            // Snapshot the previous values
            const previousFavorites = queryClient.getQueryData<string[]>(['favorites', 'me']);
            const previousHydratedFavorites = queryClient.getQueryData<VenueFavoriteItem[]>(['favorites-hydrated']);
            const previousVenue = queryClient.getQueryData<Venue>(['venue', venueId]);
            const previousVenueDetails = queryClient.getQueryData<any>(['venue-details', venueId]);
            const previousExploreContext = queryClient.getQueryData<any>(['explore-context']);
            const previousVenuesList = queryClient.getQueriesData<any[]>({ queryKey: ['venues-list-bff'] });

            // 1. Optimistically update Favorites List (UUIDs only)
            queryClient.setQueryData<string[]>(['favorites', 'me'], (old) => {
                const currentList = old || [];
                if (isFavorite) {
                    return currentList.filter(id => id !== venueId);
                } else {
                    return [...currentList, venueId];
                }
            });

            // 2. Optimistically update Hydrated Favorites (the ones in the Favorites tab)
            if (isFavorite && previousHydratedFavorites) {
                queryClient.setQueryData<VenueFavoriteItem[]>(['favorites-hydrated'], (old) => {
                    return (old || []).filter(item => item.id !== venueId);
                });
            }

            // 3. Optimistically update Explore Context (Map Venues)
            if (previousExploreContext) {
                queryClient.setQueryData<any>(['explore-context'], (old: any) => {
                    if (!old || !old.map_venues) return old;
                    return {
                        ...old,
                        map_venues: old.map_venues.map((v: any) =>
                            v.id === venueId ? { ...v, is_favorite: !isFavorite } : v
                        )
                    };
                });
            }

            // 4. Optimistically update Venues List (BFF List Screen)
            queryClient.setQueriesData<any[]>({ queryKey: ['venues-list-bff'] }, (old: any[] | undefined) => {
                if (!old) return old;
                return old.map((v: any) =>
                    v.id === venueId ? { ...v, is_favorite: !isFavorite } : v
                );
            });

            // 5. Optimistically update Venue Count / Details
            if (previousVenue) {
                queryClient.setQueryData<Venue>(['venue', venueId], (old) => {
                    if (!old) return old;
                    const newCount = (old.favorites_count || 0) + (isFavorite ? -1 : 1);
                    return { ...old, favorites_count: Math.max(0, newCount) };
                });
            }

            if (previousVenueDetails) {
                queryClient.setQueryData<any>(['venue-details', venueId], (old: any) => {
                    if (!old) return old;
                    return {
                        ...old,
                        is_favorite: !isFavorite,
                        venue: old.venue ? {
                            ...old.venue,
                            favorites_count: Math.max(0, (old.venue.favorites_count || 0) + (isFavorite ? -1 : 1))
                        } : old.venue
                    };
                });
            }

            // Return context
            return {
                previousFavorites,
                previousHydratedFavorites,
                previousVenue,
                previousVenueDetails,
                previousExploreContext,
                previousVenuesList
            };
        },
        onError: (err, variables, context: any) => {
            // Rollback
            if (context?.previousFavorites) queryClient.setQueryData(['favorites', 'me'], context.previousFavorites);
            if (context?.previousHydratedFavorites) queryClient.setQueryData(['favorites-hydrated'], context.previousHydratedFavorites);
            if (context?.previousVenue) queryClient.setQueryData(['venue', variables.venueId], context.previousVenue);
            if (context?.previousVenueDetails) queryClient.setQueryData(['venue-details', variables.venueId], context.previousVenueDetails);
            if (context?.previousExploreContext) queryClient.setQueryData(['explore-context'], context.previousExploreContext);
            if (context?.previousVenuesList) {
                context.previousVenuesList.forEach(([queryKey, data]: [any, any]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: (data, error, variables) => {
            // Always refetch to sync with server
            queryClient.invalidateQueries({ queryKey: ['favorites', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['favorites-hydrated'] });
            queryClient.invalidateQueries({ queryKey: ['venue', variables.venueId] });
            queryClient.invalidateQueries({ queryKey: ['venue-details', variables.venueId] });
            queryClient.invalidateQueries({ queryKey: ['explore-context'] });
            queryClient.invalidateQueries({ queryKey: ['venues-list-bff'] });
        },
    });
}

import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVenueContext } from '../../../src/context/VenueContext';
import { useVenueReviews, useMarkReviewsAsRead } from '../../../src/hooks/useVenueReviews';
import { ReviewList } from '../../../src/components/reviews/ReviewList';

export default function ReviewsScreen() {
    const { currentVenueId } = useVenueContext();
    const { data, isLoading } = useVenueReviews(currentVenueId || '');

    const { mutate: markAsRead } = useMarkReviewsAsRead();

    // Mark as Read Logic (Server Side)
    useEffect(() => {
        if (currentVenueId) {
            markAsRead({ venueId: currentVenueId });
            // Keep local update for immediate UI feedback if needed, but server state is better
            AsyncStorage.setItem(`last_reviews_count_${currentVenueId}`, (data?.total || 0).toString());
        }
    }, [currentVenueId, markAsRead, data?.total]);

    if (!currentVenueId) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <Text className="text-foreground font-body">No se ha seleccionado un local.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background px-4 pt-4">
            <View className="mb-6">
                <Text className="font-brand text-3xl text-foreground mb-2">Reseñas</Text>
                <Text className="font-body text-foreground-muted">
                    Gestiona las opiniones de tus clientes y mantén una buena reputación.
                </Text>
            </View>

            <ReviewList
                reviews={data?.reviews || []}
                isLoading={isLoading}
                venueId={currentVenueId}
            />
        </SafeAreaView>
    );
}

import React from 'react';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import { Review } from '../../api/types';
import { ReviewItem } from './ReviewItem';

interface ReviewListProps {
    reviews: Review[];
    isLoading: boolean;
    venueId: string;
}

export function ReviewList({ reviews, isLoading, venueId }: ReviewListProps) {
    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center py-8">
                <ActivityIndicator size="large" color="#FA4E35" />
            </View>
        );
    }

    if (!reviews.length) {
        return (
            <View className="flex-1 items-center justify-center py-12">
                <Text className="text-foreground-muted font-body text-center">
                    Aún no hay reseñas para este local.
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <ReviewItem review={item} venueId={venueId} />
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
        />
    );
}

import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useVenuesList } from '../../../src/hooks/useVenuesList';
import type { VenueListItemBFF } from '../../../src/types';
import { useToggleFavoriteVenue } from '../../../src/hooks/useFavorites';

export default function VenuesListScreen() {
    const router = useRouter();
    const { mutate: toggleFavorite } = useToggleFavoriteVenue();

    // Por ahora usamos los valores por defecto: skip=0, limit=50
    const { data: venues, isLoading, isError, refetch } = useVenuesList();

    const handlePressVenue = (venue: VenueListItemBFF) => {
        router.push(`/(user)/venue/${venue.id}`);
    };

    const renderItem = ({ item }: { item: VenueListItemBFF }) => {
        return (
            <TouchableOpacity
                onPress={() => handlePressVenue(item)}
                className="mb-3 rounded-2xl bg-surface px-4 py-3 border border-surface-active"
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                        <View className="flex-row justify-between items-start">
                            <Text className="font-brand text-lg text-foreground flex-1 pr-2" numberOfLines={1}>
                                {item.name}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    toggleFavorite({ venueId: item.id, isFavorite: item.is_favorite }, {
                                        onSuccess: () => refetch() // Simple brute-force refresh for now
                                    });
                                }}
                                className="p-1"
                            >
                                <Ionicons
                                    name={item.is_favorite ? "heart" : "heart-outline"}
                                    size={20}
                                    color={item.is_favorite ? "#EF4444" : "#94A3B8"}
                                />
                            </TouchableOpacity>
                        </View>

                        {item.address_display ? (
                            <Text
                                className="font-body text-sm text-foreground-muted mt-1"
                                numberOfLines={1}
                            >
                                {item.address_display}
                            </Text>
                        ) : null}

                        <View className="flex-row items-center mt-2">
                            <Text className="font-body text-xs text-foreground-muted">
                                ⭐ {item.rating_average?.toFixed(1) ?? '0.0'}
                            </Text>
                            <Text className="font-body text-xs text-foreground-muted ml-2">
                                ({item.review_count ?? 0} reseñas)
                            </Text>
                        </View>

                        <View className="flex-row flex-wrap gap-2 mt-2">
                            {item.is_founder_venue && (
                                <View className="bg-warning/20 px-2 py-0.5 rounded-full">
                                    <Text className="text-warning text-[10px] font-body-bold uppercase">
                                        Fundador
                                    </Text>
                                </View>
                            )}
                            {item.verification_status === 'verified' && (
                                <View className="bg-success/20 px-2 py-0.5 rounded-full">
                                    <Text className="text-success text-[10px] font-body-bold uppercase">
                                        Verificado
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-row gap-2 mt-3">
                            <TouchableOpacity
                                onPress={() => router.push(`/(user)/venue/${item.id}`)}
                                className="flex-1 bg-primary py-2 rounded-lg items-center"
                            >
                                <Text className="text-white font-body-bold text-xs">Ver Detalles</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push({ pathname: '/(user)/(tabs)/explore', params: { venueId: item.id } })}
                                className="flex-1 bg-surface-active py-2 rounded-lg items-center"
                            >
                                <Text className="text-foreground font-body-bold text-xs">Ver en Mapa</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator color="#FA4E35" />
                <Text className="mt-3 text-foreground font-body">
                    Cargando locales...
                </Text>
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
                <Text className="text-foreground font-body text-center">
                    Hubo un problema al cargar los locales. Intenta nuevamente más tarde.
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background px-4 pt-4">
            <Text className="font-brand text-2xl text-foreground mb-4">
                Locales en la Zona Cero
            </Text>

            <FlatList
                data={venues ?? []}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 32 }}
            />
        </SafeAreaView>
    );
}

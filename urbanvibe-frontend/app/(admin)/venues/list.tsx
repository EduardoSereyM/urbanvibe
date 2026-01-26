// app/(admin)/venues/index.tsx
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AdminVenuesFilters } from '../../../src/api/types';
import { AdminProfileButton } from '../../../src/components/AdminProfileButton';
import { useAdminVenuesList } from '../../../src/hooks/useAdminVenues';
import { useDebounce } from '../../../src/hooks/useDebounce';

export default function AdminVenuesListScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<AdminVenuesFilters>({
        limit: 20,
        skip: 0,
    });

    const debouncedSearch = useDebounce(search, 500);

    const { data, isLoading, error, isFetching, refetch } = useAdminVenuesList({
        ...filters,
        search: debouncedSearch || undefined,
    });

    useFocusEffect(
        React.useCallback(() => {
            refetch();
        }, [refetch])
    );

    const handleVenuePress = (venueId: string) => {
        router.push(`/(admin)/venues/${venueId}`);
    };

    // Solo mostrar loading a pantalla completa si es la PRIMERA carga y no hay datos
    if (isLoading && !data) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#FA4E35" />
                <Text className="text-foreground-muted mt-4">Cargando locales...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
                <Text className="text-error text-xl font-brand mb-4">Error al cargar locales</Text>
                <Text className="text-foreground-muted text-center">
                    {error instanceof Error ? error.message : 'Error desconocido'}
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="px-6 py-4 border-b border-surface-active">

                <Text className="font-brand text-3xl text-foreground mb-2">
                    Panel de Locales
                </Text>
                <View className="flex-row items-center">
                    <Text className="font-body text-foreground-muted">
                        {data?.total || 0} locales en total
                    </Text>
                    {isFetching && (
                        <View className="flex-row items-center ml-2">
                            <ActivityIndicator size="small" color="#FA4E35" />
                            <Text className="text-primary ml-2">Cargando</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Search Bar */}
            <View className="px-6 py-4">
                <TextInput
                    className="bg-surface border border-surface-active rounded-xl px-4 py-3 text-foreground font-body"
                    placeholder="Buscar por nombre o dirección..."
                    placeholderTextColor="#828BA0"
                    value={search}
                    onChangeText={setSearch}
                    selectionColor="#FA4E35"
                />
            </View>

            {/* Venues List */}
            <FlatList
                data={data?.venues || []}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleVenuePress(item.id)}
                        className="bg-surface rounded-2xl p-4 mb-4 border border-surface-active"
                    >
                        {/* Venue Name */}
                        <Text className="font-brand text-xl text-foreground mb-1">
                            {item.name}
                        </Text>

                        {/* Legal Name */}
                        {item.legal_name && (
                            <Text className="font-body text-sm text-foreground-muted mb-2">
                                {item.legal_name}
                            </Text>
                        )}

                        {/* Location */}
                        <View className="flex-row items-center mb-3">
                            <Text className="text-2xl mr-2">📍</Text>
                            <Text className="font-body text-foreground-muted flex-1">
                                {item.address_display}, {item.city}
                            </Text>
                        </View>

                        {/* Status Badges */}
                        <View className="flex-row flex-wrap gap-2 mb-3">
                            {/* Verification Status */}
                            {/* Verification Status */}
                            <View
                                className={`px-3 py-1 rounded-full ${item.is_verified
                                    ? 'bg-success/20'
                                    : 'bg-surface-active'
                                    }`}
                            >
                                <Text
                                    className={`font-body-semibold text-xs ${item.is_verified
                                        ? 'text-success'
                                        : 'text-foreground-muted'
                                        }`}
                                >
                                    {item.is_verified
                                        ? '✓ Verificado'
                                        : '✗ No Verificado'}
                                </Text>
                            </View>

                            {/* Operational Status */}
                            <View
                                className={`px-3 py-1 rounded-full ${item.is_operational ? 'bg-primary/20' : 'bg-surface-active'
                                    }`}
                            >
                                <Text
                                    className={`font-body-semibold text-xs ${item.is_operational ? 'text-primary' : 'text-foreground-muted'
                                        }`}
                                >
                                    {item.is_operational ? '🟢 Operativo' : '🔴 Inactivo'}
                                </Text>
                            </View>

                            {/* Testing Status */}
                            {item.is_testing && (
                                <View className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50">
                                    <Text className="font-body-semibold text-xs text-red-400">
                                        🛠️ PRUEBA
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Metrics */}
                        <View className="flex-row justify-between">
                            <View className="flex-row items-center">
                                <Text className="text-lg mr-1">⭐</Text>
                                <Text className="font-body-semibold text-foreground">
                                    {item.rating_average.toFixed(1)}
                                </Text>
                                <Text className="font-body text-foreground-muted ml-1">
                                    ({item.total_reviews})
                                </Text>
                            </View>

                            <View className="flex-row items-center">
                                <Text className="text-lg mr-1">👥</Text>
                                <Text className="font-body-semibold text-foreground">
                                    {item.total_verified_visits}
                                </Text>
                                <Text className="font-body text-foreground-muted ml-1">
                                    visitas
                                </Text>
                            </View>
                        </View>

                        {/* Owner Info */}
                        <View className="mt-3 pt-3 border-t border-surface-active">
                            <Text className="font-body text-xs text-foreground-muted">
                                Dueño: {item.owner ? (item.owner.display_name || item.owner.email) : 'Sin dueño asignado'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center py-12">
                        <Text className="text-6xl mb-4">🔍</Text>
                        <Text className="font-brand text-xl text-foreground mb-2">
                            No se encontraron locales
                        </Text>
                        <Text className="font-body text-foreground-muted text-center">
                            Intenta ajustar los filtros de búsqueda
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

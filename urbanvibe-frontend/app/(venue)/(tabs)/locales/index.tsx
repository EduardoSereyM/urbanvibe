// app/(venue)/(tabs)/locales/index.tsx
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { VenueSummaryForOwner } from '../../../../src/api/types';
import { useMyAdminVenues } from '../../../../src/hooks/useAdminVenues';
import { ExitConfirmationModal } from '../../../../src/components/ExitConfirmationModal';
import { supabase } from '../../../../src/lib/supabase';

export default function VenueOwnerEntryScreen() {
    const router = useRouter();
    const { data, isLoading, isError } = useMyAdminVenues();
    const [exitModalVisible, setExitModalVisible] = useState(false);

    const venues = data?.venues ?? [];

    const { ignoreRedirect } = useLocalSearchParams<{ ignoreRedirect?: string }>();

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                setExitModalVisible(true);
                return true;
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => backHandler.remove();
        }, [])
    );

    const handleLogout = async () => {
        setExitModalVisible(false);
        await supabase.auth.signOut();
        router.replace('/(auth)/login');
    };

    const handleExit = () => {
        BackHandler.exitApp();
    };

    const handleCreateVenue = () => {
        router.push('/(venue)/(tabs)/locales/create');
    };

    const handleSelectVenue = (venue: VenueSummaryForOwner) => {
        router.push(`/(venue)/(tabs)/locales/${venue.id}`);
    };

    const renderVenueItem = ({ item }: { item: VenueSummaryForOwner }) => {
        const statusColor =
            item.verification_status === 'verified' ? 'text-success' :
                item.verification_status === 'rejected' ? 'text-destructive' :
                    'text-warning';

        return (
            <TouchableOpacity
                onPress={() => handleSelectVenue(item)}
                className="mb-3 rounded-2xl bg-surface px-4 py-4 border border-surface-active"
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <Text className="font-brand text-lg text-foreground" numberOfLines={1}>
                            {item.name}
                        </Text>

                        {item.city && (
                            <Text className="font-body text-sm text-foreground-muted mt-1">
                                {item.city}
                            </Text>
                        )}

                        <View className="flex-row items-center mt-2">
                            <Text className={`font-body text-xs ${statusColor}`}>
                                {item.verification_status === 'verified' ? '✓ Verificado' :
                                    item.verification_status === 'rejected' ? '✗ Rechazado' :
                                        '⏳ Pendiente'}
                            </Text>

                            {item.is_founder_venue && (
                                <Text className="font-body text-xs text-primary ml-3">
                                    🏆 Fundador
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#FA4E35" />
                <Text className="mt-3 text-foreground font-body">
                    Cargando tus locales...
                </Text>
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
                <Text className="font-brand text-2xl text-foreground text-center mb-2">
                    Acceso Restringido
                </Text>
                <Text className="text-foreground-muted font-body text-center mb-8">
                    Necesitas iniciar sesión con una cuenta de Local para acceder a esta sección.
                </Text>
                <TouchableOpacity
                    onPress={() => router.replace('/(auth)/login')}
                    className="bg-primary px-8 py-4 rounded-full mb-3"
                >
                    <Text className="text-primary-foreground font-body-bold">Iniciar Sesión</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="px-6 py-3"
                >
                    <Text className="text-foreground-muted font-body">Volver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="mt-6"
                >
                    <Text className="text-destructive font-body-bold">Cerrar Sesión Activa</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // No venues - show create prompt
    if (venues.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
                <Text className="font-brand text-3xl text-foreground text-center mb-4">
                    Bienvenido al Mundo Local
                </Text>

                <Text className="font-body text-foreground-muted text-center mb-8">
                    Aún no tienes locales registrados. Crea tu primer local para comenzar.
                </Text>

                <TouchableOpacity
                    onPress={handleCreateVenue}
                    className="bg-primary px-8 py-4 rounded-full"
                >
                    <Text className="text-primary-foreground font-brand text-lg">
                        Crear mi Local
                    </Text>
                </TouchableOpacity>

                <ExitConfirmationModal
                    visible={exitModalVisible}
                    onCancel={() => setExitModalVisible(false)}
                    onLogout={handleLogout}
                    onExit={handleExit}
                />
            </SafeAreaView>
        );
    }

    // Multiple venues - show list
    return (
        <SafeAreaView className="flex-1 bg-background px-4 pt-8">
            <View className="flex-row items-center justify-between mb-4 px-4">
                <Text className="font-brand text-2xl text-foreground">
                    Mis Locales
                </Text>

                <TouchableOpacity
                    onPress={handleCreateVenue}
                    className="bg-success/60  px-4 py-2 rounded-full"
                >
                    <Text className="text-primary-foreground font-body-bold">
                        + Nuevo
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList className="pt-8"
                data={venues}
                keyExtractor={(item) => item.id}
                renderItem={renderVenueItem}
                contentContainerStyle={{ paddingBottom: 32 }}
            />

            <ExitConfirmationModal
                visible={exitModalVisible}
                onCancel={() => setExitModalVisible(false)}
                onLogout={handleLogout}
                onExit={handleExit}
            />
        </SafeAreaView>
    );
}

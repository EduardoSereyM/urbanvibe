// app/(venue)/(tabs)/locales/[venueId].tsx
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, BackHandler, RefreshControl, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useVenueContext } from '../../../../src/context/VenueContext';
import { useAdminVenueDetail, useVenueCheckins, useConfirmCheckin } from '../../../../src/hooks/useAdminVenues';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { VenueBalanceCard } from '../../../../src/components/promotions/VenueBalanceCard';

export default function VenueDashboardScreen() {
    const router = useRouter();
    const { venueId } = useLocalSearchParams<{ venueId: string }>();
    const { setCurrentVenueId } = useVenueContext();
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();

    // Sync context when entering
    useFocusEffect(
        useCallback(() => {
            if (venueId) setCurrentVenueId(venueId);
        }, [venueId])
    );

    const { data: venue, isLoading, isError, refetch: refetchVenue } = useAdminVenueDetail(venueId || '');
    const { data: checkinsData, isLoading: isLoadingCheckins, refetch: refetchCheckins } = useVenueCheckins(venueId || '');
    const confirmMutation = useConfirmCheckin();

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchVenue(), refetchCheckins()]);
        setRefreshing(false);
    }, [refetchVenue, refetchCheckins]);

    // Handle Back to List
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (router.canGoBack()) {
                    router.back();
                } else {
                    router.replace('/(venue)/(tabs)/locales');
                }
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [router])
    );

    if (isLoading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#FA4E35" />
            </View>
        );
    }

    if (isError || !venue) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <Text className="text-foreground font-body mb-4">No se pudo cargar el local.</Text>
                <TouchableOpacity onPress={() => router.replace('/(venue)/(tabs)/locales')} className="bg-primary px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const coverImage = venue.cover_image_urls?.[0] || 'https://via.placeholder.com/800x400';
    const logoImage = venue.logo_url || 'https://via.placeholder.com/100';

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FA4E35" />}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. SOCIAL HEADER */}
                <View className="relative h-64 w-full mb-12">
                    <Image source={{ uri: coverImage }} className="w-full h-full" resizeMode="cover" />
                    <LinearGradient
                        colors={['transparent', '#09090B']}
                        className="absolute bottom-0 left-0 right-0 h-32"
                    />

                    {/* Navbar Overlay */}
                    <View className="absolute top-0 left-0 right-0 flex-row justify-between items-center px-4" style={{ paddingTop: insets.top + 10 }}>
                        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full items-center justify-center">
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                            <Text className="text-white font-bold text-xs uppercase tracking-wider">
                                {venue.operational_status === 'open' ? '🟢 Abierto' : '🔴 Cerrado'}
                            </Text>
                        </View>
                    </View>

                    {/* Logo & Identity */}
                    <View className="absolute -bottom-10 left-4 flex-row items-end">
                        <Image
                            source={{ uri: logoImage }}
                            className="w-24 h-24 rounded-2xl border-4 border-background bg-surface"
                        />
                        <View className="mb-11 ml-3 shadow-sm">
                            <Text className="text-2xl font-brand text-white shadow-black" numberOfLines={1}>
                                {venue.name}
                            </Text>
                            {venue.is_founder_venue && (
                                <View className="flex-row items-center">
                                    <Ionicons name="trophy" size={12} color="#EAB308" />
                                    <Text className="text-yellow-500 font-bold text-xs ml-1">FOUNDER VENUE</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* 2. VENUE BALANCE & METRICS */}
                <View className="px-4 mt-2 mb-6">
                    <VenueBalanceCard
                        balance={venue.points_balance || 0}
                        onHistoryPress={() => { /* TODO: Navigate to points history */ }}
                    />

                    <View className="flex-row mt-4 justify-between bg-surface rounded-xl p-4 border border-border">
                        <View className="items-center flex-1 border-r border-border/30">
                            <Text className="text-xl font-bold text-foreground">{venue.verified_visits_monthly}</Text>
                            <Text className="text-[10px] uppercase text-foreground-muted tracking-wide text-center">Visitas Mes</Text>
                        </View>
                        <View className="items-center flex-1 border-r border-border/30">
                            <Text className="text-xl font-bold text-foreground">{venue.rating_average.toFixed(1)}</Text>
                            <Text className="text-[10px] uppercase text-foreground-muted tracking-wide text-center">Rating</Text>
                        </View>
                        <View className="items-center flex-1">
                            <Text className="text-xl font-bold text-foreground">{venue.review_count}</Text>
                            <Text className="text-[10px] uppercase text-foreground-muted tracking-wide text-center">Reseñas</Text>
                        </View>
                    </View>
                </View>

                {/* 3. MAIN ACTIONS - THE "BUTTONS" */}
                <View className="px-4 mb-8">
                    <Text className="text-foreground-muted text-xs uppercase mb-3 font-bold px-1">Acciones Rápidas</Text>

                    <View className="flex-row gap-3 mb-3">
                        {/* Primary: Edit */}
                        <TouchableOpacity
                            onPress={() => router.push(`/(venue)/(tabs)/locales/${venueId}/edit`)}
                            className="flex-1 bg-primary h-14 rounded-xl flex-row items-center justify-center shadow-lg shadow-primary/20"
                        >
                            <Ionicons name="create-outline" size={22} color="#FFF" />
                            <Text className="text-white font-bold ml-2">Editar</Text>
                        </TouchableOpacity>

                        {/* Secondary: Team */}
                        <TouchableOpacity
                            onPress={() => router.push(`/(venue)/team`)}
                            className="flex-1 bg-surface border border-border h-14 rounded-xl flex-row items-center justify-center"
                        >
                            <Ionicons name="people-outline" size={22} color="#A1A1AA" />
                            <Text className="text-foreground font-bold ml-2">Equipo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tertiary: Check-in (Yellow) */}
                    <TouchableOpacity
                        onPress={() => {
                            if (venueId) {
                                setCurrentVenueId(venueId);
                                router.push('/(venue)/(tabs)/qr-checkin');
                            }
                        }}
                        className="w-full bg-yellow-500/10 border border-yellow-500/50 h-12 rounded-xl flex-row items-center justify-center"
                    >
                        <Ionicons name="qr-code-outline" size={20} color="#EAB308" />
                        <Text className="text-yellow-500 font-bold ml-2">Scanner Check-in</Text>
                    </TouchableOpacity>
                </View>

                {/* 4. RECENT ACTIVITY FEED */}
                <View className="px-4">
                    <View className="flex-row justify-between items-center mb-4 px-1">
                        <Text className="text-lg font-heading text-foreground">Actividad Reciente</Text>
                        <TouchableOpacity>
                            <Text className="text-primary text-sm">Ver todo</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-surface rounded-2xl border border-border overflow-hidden">
                        {!venue.recent_activity || venue.recent_activity.length === 0 ? (
                            <View className="p-8 items-center py-12">
                                <Ionicons name="time-outline" size={48} color="#3F3F46" />
                                <Text className="text-foreground-muted mt-2">Sin actividad reciente.</Text>
                            </View>
                        ) : (
                            venue.recent_activity.map((activity, idx) => (
                                <TouchableOpacity
                                    key={activity.id}
                                    onPress={() => {
                                        if (activity.type === 'review') {
                                            router.push('/(venue)/(tabs)/reviews');
                                        } else if (activity.type === 'checkin') {
                                            // Create simple check-in screen or just confirm?
                                            // User requested separate check-in screen. For now, navigate to QR check-in as placeholder or just confirm action.
                                            // "Should directly navigate to the Check-in screen"
                                            router.push('/(venue)/(tabs)/qr-checkin'); // Placeholder until Check-in screen is made
                                        }
                                    }}
                                    className={`p-4 flex-row items-start ${idx < (venue.recent_activity?.length || 0) - 1 ? 'border-b border-border/40' : ''}`}
                                >
                                    {/* Type Icon & Avatar */}
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 border border-border ${activity.type === 'review' ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-surface-highlight'}`}>
                                        {activity.type === 'review' ? (
                                            <Ionicons name="star" size={18} color="#EAB308" />
                                        ) : (
                                            <Text className="text-foreground-muted font-bold">
                                                {activity.title.charAt(0)}
                                            </Text>
                                        )}
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-foreground font-bold text-sm" numberOfLines={1}>
                                            {activity.title}
                                        </Text>

                                        <Text className="text-foreground-muted text-xs mt-0.5" numberOfLines={2}>
                                            {activity.subtitle}
                                        </Text>

                                        <Text className="text-foreground-muted text-[10px] mt-1">
                                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: es })}
                                        </Text>
                                    </View>

                                    {/* Actions */}
                                    <View>
                                        {activity.type === 'checkin' && activity.metadata?.status === 'pending' ? (
                                            <TouchableOpacity
                                                onPress={() => confirmMutation.mutate({ venueId: venueId!, checkinId: activity.metadata?.checkin_id })}
                                                className="bg-primary px-3 py-1.5 rounded-full shadow-sm"
                                            >
                                                <Text className="text-white text-[10px] font-bold">Confirmar</Text>
                                            </TouchableOpacity>
                                        ) : activity.type === 'checkin' && activity.metadata?.status ? (
                                            // Checkin Status Badge
                                            <View className={`px-2 py-1 rounded-md ${activity.metadata.status === 'confirmed' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                                <Text className={`text-[10px] font-bold uppercase ${activity.metadata.status === 'confirmed' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {activity.metadata.status === 'confirmed' ? 'Validado' : 'Rechazado'}
                                                </Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}


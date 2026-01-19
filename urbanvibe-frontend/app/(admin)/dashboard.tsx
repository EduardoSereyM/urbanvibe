import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminProfileButton } from '../../src/components/AdminProfileButton';
import { useAdminMetrics } from '../../src/hooks/useAdminMetrics';
import { useProfile } from '../../src/hooks/useProfile';

export default function AdminDashboardScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [period, setPeriod] = useState<'24h' | '7d' | '30d' | '90d' | 'all'>('30d');

    const { data: metrics, isLoading, error, refetch } = useAdminMetrics(period);
    const { data: profile } = useProfile();

    // Screen Logging
    useFocusEffect(
        useCallback(() => {
            console.log("📍 [File: urbanvibe-frontend/app/(admin)/dashboard.tsx] Current Screen: Admin Dashboard");
            if (profile) {
                console.log("👤 [Dashboard Debug] Profile Data:", profile);
            }
        }, [profile])
    );

    const onRefresh = React.useCallback(() => {
        refetch();
    }, [refetch]);

    if (isLoading && !metrics) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color="#00E5FF" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-background p-6">
                <Text className="text-destructive text-lg mb-2">Error al cargar métricas</Text>
                <TouchableOpacity onPress={() => refetch()} className="bg-surface px-4 py-2 rounded-lg">
                    <Text className="text-foreground">Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="px-6 py-4 border-b border-border">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <Text className="text-2xl">←</Text>
                        </TouchableOpacity>
                        <View>
                            <Text className="font-heading text-2xl text-foreground">
                                Dashboard
                            </Text>
                            <Text className="font-body text-sm text-foreground-muted">
                                Bienvenido, {profile?.username || 'Administrador'}
                            </Text>
                        </View>
                    </View>
                    <AdminProfileButton />
                </View>


                {/* Period Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2">
                    {['24h', '7d', '30d', '90d', 'all'].map((p) => (
                        <TouchableOpacity
                            key={p}
                            onPress={() => setPeriod(p as any)}
                            className={`px-4 py-1 rounded-full mr-2 border ${period === p ? 'bg-primary border-primary' : 'bg-transparent border-border'
                                }`}
                        >
                            <Text className={`font-bold ${period === p ? 'text-primary-foreground' : 'text-foreground-muted'}`}>
                                {p === 'all' ? 'Todo' : p === '24h' ? `Últimas ${p}` : `Últimos ${p}`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#00E5FF" />}
                showsVerticalScrollIndicator={false}
            >
                {/* Key Metrics Grid */}
                <View className="flex-row flex-wrap justify-between mb-6">
                    <MetricCard
                        label="Usuarios Totales"
                        value={metrics?.totals.total_users || 0}
                        trend="+12%" // Placeholder trend
                        color="text-primary"
                    />
                    <MetricCard
                        label="Locales"
                        value={metrics?.totals.total_venues || 0}
                        trend="+5%"
                        color="text-accent-cyber"
                    />
                    <MetricCard
                        label="Reseñas"
                        value={metrics?.totals.total_reviews || 0}
                        trend="+8%"
                        color="text-success"
                    />
                    <MetricCard
                        label="Visitas Verif."
                        value={metrics?.totals.total_verified_visits || 0}
                        trend="+15%"
                        color="text-warning"
                    />
                </View>

                {/* Venues Status */}
                <Text className="font-heading text-lg text-foreground mb-3">Estado de Locales</Text>
                <View className="bg-surface rounded-2xl p-4 mb-6 border border-border flex-row justify-around">
                    <View className="items-center">
                        <Text className="text-2xl font-bold text-success">{metrics?.venues.by_status.verified || 0}</Text>
                        <Text className="text-xs text-foreground-muted">Verificados</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-2xl font-bold text-warning">{metrics?.venues.by_status.pending || 0}</Text>
                        <Text className="text-xs text-foreground-muted">Pendientes</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-2xl font-bold text-destructive">{metrics?.venues.by_status.rejected || 0}</Text>
                        <Text className="text-xs text-foreground-muted">Rechazados</Text>
                    </View>
                </View>

                {/* Top Venues */}
                <Text className="font-heading text-lg text-foreground mb-3">Top Locales</Text>
                {metrics?.top_venues.map((venue, index) => (
                    <TouchableOpacity
                        key={venue.id}
                        onPress={() => router.push(`/(admin)/venues/${venue.id}`)}
                        className="bg-surface rounded-xl p-4 mb-3 border border-border flex-row items-center"
                    >
                        <Text className="font-heading text-lg text-foreground-muted mr-4 w-6 text-center">
                            #{index + 1}
                        </Text>
                        <View className="flex-1">
                            <Text className="font-bold text-foreground">{venue.name}</Text>
                            <Text className="text-xs text-foreground-muted">{venue.city}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-primary font-bold">⭐ {venue.rating_average.toFixed(1)}</Text>
                            <Text className="text-xs text-foreground-muted">{venue.total_verified_visits} visitas</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Recent Activity */}
                <Text className="font-heading text-lg text-foreground mb-3 mt-4">Actividad Reciente</Text>
                <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
                    {metrics?.recent_activity.map((activity, index) => (
                        <View key={index} className="flex-row items-center py-3 border-b border-border/30 last:border-0">
                            <View className={`w-2 h-2 rounded-full mr-3 ${activity.type === 'new_venue' ? 'bg-accent-cyber' :
                                activity.type === 'new_user' ? 'bg-primary' :
                                    activity.type === 'checkin' ? 'bg-warning' : 'bg-success'
                                }`} />
                            <View className="flex-1">
                                <Text className="text-foreground text-sm">
                                    {activity.type === 'new_venue' && `Nuevo local: ${activity.venue_name}`}
                                    {activity.type === 'new_user' && `Nuevo usuario: ${activity.user_email}`}
                                    {activity.type === 'venue_verified' && `Local verificado: ${activity.venue_name}`}
                                    {activity.type === 'checkin' && `Nuevo check-in: ${activity.user_email} en ${activity.venue_name}`}
                                </Text>
                                <Text className="text-xs text-foreground-muted">
                                    {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString()}
                                </Text>
                            </View>
                        </View>
                    ))}
                    {(!metrics?.recent_activity || metrics.recent_activity.length === 0) && (
                        <Text className="text-foreground-muted text-center italic">No hay actividad reciente</Text>
                    )}
                </View>

                <View className="h-10" />
            </ScrollView>
        </View >
    );
}

function MetricCard({ label, value, trend, color }: { label: string, value: number, trend: string, color: string }) {
    return (
        <View className="bg-surface rounded-2xl p-4 mb-4 w-[48%] border border-border">
            <Text className="text-foreground-muted text-xs mb-1">{label}</Text>
            <Text className={`font-heading text-2xl ${color}`}>{value.toLocaleString()}</Text>
            {/* <Text className="text-xs text-foreground-muted mt-1">{trend} vs periodo ant.</Text> */}
        </View>
    );
}

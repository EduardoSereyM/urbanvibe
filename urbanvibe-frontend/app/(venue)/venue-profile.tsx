import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useVenue } from '../../src/context/VenueContext';
import { fetchAdminVenueDetail } from '../../src/api/client';
import { VenueB2BDetail } from '../../src/api/types';

// Components
const SectionTitle = ({ title, icon }: { title: string; icon?: string }) => (
    <View className="flex-row items-center mb-3 mt-6 px-4">
        {icon && <Text className="mr-2 text-primary">{icon}</Text>}
        <Text className="text-lg font-heading text-primary uppercase tracking-wider">{title}</Text>
    </View>
);

const DetailCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <View className={`bg-surface mx-4 p-4 rounded-xl border border-border/50 mb-3 ${className}`}>
        {children}
    </View>
);

const StatItem = ({ value, label, color = "text-foreground" }: { value: string | number; label: string; color?: string }) => (
    <View className="flex-1 items-center justify-center p-2">
        <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
        <Text className="text-xs text-foreground-muted uppercase text-center mt-1">{label}</Text>
    </View>
);

const FeatureTag = ({ label }: { label: string }) => (
    <View className="bg-surface-highlight px-3 py-1 rounded-full mr-2 mb-2 border border-border/30">
        <Text className="text-xs text-foreground-muted">{label}</Text>
    </View>
);

export default function VenueProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { currentVenueId: contextVenueId } = useVenue();
    const { venueId } = useLocalSearchParams<{ venueId: string }>();

    // Prioritize param, then context
    const currentVenueId = venueId || contextVenueId;

    const [venue, setVenue] = useState<VenueB2BDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentVenueId) {
            loadVenue();
        }
    }, [currentVenueId]);

    const loadVenue = async () => {
        try {
            setLoading(true);
            const data = await fetchAdminVenueDetail(currentVenueId!);
            setVenue(data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo cargar el perfil del local.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-background justify-center items-center">
                <ActivityIndicator size="large" color="#FA4E35" />
            </View>
        );
    }

    if (!venue) {
        return (
            <View className="flex-1 bg-background justify-center items-center p-6">
                <Text className="text-foreground-muted text-center mb-4">No se encontró información del local.</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-surface px-6 py-3 rounded-xl border border-border">
                    <Text className="text-foreground">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Calculations & Formats
    const coverImage = venue.cover_image_urls?.[0] || 'https://via.placeholder.com/400x200';
    const categories = Object.keys(venue.music_profile || {}).join(', ') || 'Variado';
    const paymentMethods = Object.entries(venue.payment_methods || {})
        .filter(([_, v]) => v)
        .map(([k]) => k.replace('_', ' '))
        .join(', ');

    return (
        <View className="flex-1 bg-background">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* 1. Identity Header */}
                <View className="relative h-64 w-full">
                    <Image source={{ uri: coverImage }} className="w-full h-full" resizeMode="cover" />
                    <LinearGradient
                        colors={['transparent', '#09090B']}
                        className="absolute bottom-0 left-0 right-0 h-40"
                    />

                    {/* Top Bar (Back + Edit) */}
                    <View className="absolute top-0 left-0 right-0 flex-row justify-between items-center px-4" style={{ paddingTop: insets.top + 10 }}>
                        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full items-center justify-center">
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity className="px-4 py-2 bg-primary/90 backdrop-blur-md rounded-full">
                            <Text className="text-white font-bold text-xs">EDITAR PERFIL</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Venue Identity */}
                    <View className="absolute bottom-6 left-4 right-4 flex-row items-end">
                        <Image
                            source={{ uri: venue.logo_url || 'https://via.placeholder.com/100' }}
                            className="w-20 h-20 rounded-2xl border-2 border-background mr-4 bg-muted"
                        />
                        <View className="flex-1 pb-1">
                            {venue.is_founder_venue && (
                                <View className="bg-yellow-500/20 self-start px-2 py-0.5 rounded mb-1 border border-yellow-500/50">
                                    <Text className="text-yellow-500 text-[10px] font-bold uppercase">Founder Venue</Text>
                                </View>
                            )}
                            <Text className="text-2xl font-heading text-white shadow-sm" numberOfLines={1}>{venue.name}</Text>
                            <Text className="text-white/80 text-sm italic" numberOfLines={1}>{venue.slogan || 'Sin slogan definido'}</Text>
                        </View>
                    </View>
                </View>

                {/* 2. Dashboard / Quick Stats */}
                <View className="px-4 -mt-4 mb-4">
                    <View className="bg-surface border border-border rounded-xl flex-row p-4 shadow-lg">
                        <View className="flex-1">
                            <Text className="text-xs text-foreground-muted uppercase">Estado Operativo</Text>
                            <View className="flex-row items-center mt-1">
                                <View className={`w-2 h-2 rounded-full mr-2 ${venue.operational_status === 'open' ? 'bg-green-500' : 'bg-red-500'}`} />
                                <Text className="text-foreground font-bold capitalize">{venue.operational_status?.replace('_', ' ') || 'Desconocido'}</Text>
                            </View>
                        </View>
                        <View className="w-[1px] bg-border/50 mx-2" />
                        <View className="flex-1 items-end">
                            <Text className="text-xs text-foreground-muted uppercase">Balance Puntos</Text>
                            <Text className="text-xl font-bold text-accent-cyber">{venue.points_balance}</Text>
                        </View>
                    </View>
                </View>

                {/* KPI Grid */}
                <View className="flex-row mx-4 mb-6">
                    <View className="flex-1 bg-surface rounded-xl p-3 mr-2 border border-border/50">
                        <Text className="text-3xl font-bold text-white text-center">{venue.rating_average}</Text>
                        <Text className="text-[10px] text-foreground-muted text-center uppercase tracking-wider mt-1">Rating ({venue.review_count})</Text>
                    </View>
                    <View className="flex-1 bg-surface rounded-xl p-3 mr-2 border border-border/50">
                        <Text className="text-3xl font-bold text-white text-center">{venue.verified_visits_monthly}</Text>
                        <Text className="text-[10px] text-foreground-muted text-center uppercase tracking-wider mt-1">Visitas Mes</Text>
                    </View>
                    <View className="flex-1 bg-surface rounded-xl p-3 border border-border/50">
                        <Text className="text-3xl font-bold text-white text-center">{venue.verified_visits_all_time}</Text>
                        <Text className="text-[10px] text-foreground-muted text-center uppercase tracking-wider mt-1">Visitas Totales</Text>
                    </View>
                </View>

                {/* 3. General Information */}
                <SectionTitle title="Información General" />
                <DetailCard>
                    <Text className="text-foreground-muted mb-4 leading-6">{venue.overview || 'Sin descripción disponible.'}</Text>

                    <View className="space-y-3">
                        <InfoRow label="Categoría ID" value={venue.category_id || '-'} />
                        <InfoRow label="Rango Precios" value={`${venue.price_tier ? '$'.repeat(venue.price_tier) : '-'} (${venue.currency_code})`} />
                        <InfoRow label="Dirección" value={venue.address?.address_display || '-'} />
                        <InfoRow label="Website" value={venue.contact?.website || '-'} isLink />
                    </View>
                </DetailCard>

                {/* 4. Operations */}
                <SectionTitle title="Operaciones" />
                <DetailCard>
                    <InfoRow label="Capacidad" value={`${venue.seated_capacity || 0} sentados / ${venue.capacity_estimate || 0} total`} />
                    <InfoRow label="Nivel de Ruido" value={venue.noise_level || '-'} capitalize />
                    <InfoRow label="Pagos" value={paymentMethods || 'Efectivo'} />
                    <View className="mt-4 pt-4 border-t border-border/30">
                        <Text className="text-foreground-muted mb-2 text-xs uppercase">Horarios Regulares</Text>
                        {venue.opening_hours?.regular?.map((slot, idx) => (
                            <View key={idx} className="flex-row justify-between py-1">
                                <Text className="text-foreground capitalize w-24">{slot.day}</Text>
                                <Text className="text-foreground-muted">{slot.closed ? 'Cerrado' : `${slot.open} - ${slot.close}`}</Text>
                            </View>
                        ))}
                    </View>
                </DetailCard>

                {/* 5. The Vibe */}
                <SectionTitle title="The Vibe" />
                <DetailCard>
                    <Text className="text-foreground-muted text-xs uppercase mb-3">Música</Text>
                    <View className="flex-row flex-wrap mb-4">
                        {Object.keys(venue.music_profile || {}).map(k => <FeatureTag key={k} label={k} />)}
                    </View>

                    <Text className="text-foreground-muted text-xs uppercase mb-3">Ambiente (Moods)</Text>
                    <View className="flex-row flex-wrap mb-4">
                        {venue.mood_tags?.map(t => <FeatureTag key={t} label={t} />)}
                    </View>

                    <Text className="text-foreground-muted text-xs uppercase mb-3">Público (Crowd)</Text>
                    <View className="flex-row flex-wrap mb-4">
                        {Object.keys(venue.crowd_profile || {}).map(k => <FeatureTag key={k} label={k} />)}
                    </View>

                    <Text className="text-foreground-muted text-xs uppercase mb-3">Amenities & Features</Text>
                    <View className="flex-row flex-wrap">
                        {[
                            ...(venue.connectivity_features || []),
                            ...(venue.comfort_features || []),
                            ...(venue.accessibility_features || [])
                        ].map(f => <FeatureTag key={f} label={f} />)}
                    </View>
                </DetailCard>

                {/* 6. Owner Actions */}
                <SectionTitle title="Gestión" />
                <View className="px-4">
                    <TouchableOpacity
                        className="bg-surface border border-border p-4 rounded-xl mb-3 flex-row items-center justify-between"
                        onPress={() => router.push(`/(venue)/team`)} // Assuming this route exists based on user request
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center mr-3">
                                <Ionicons name="people" size={20} color="#FA4E35" />
                            </View>
                            <View>
                                <Text className="text-foreground font-bold">Gestionar Equipo</Text>
                                <Text className="text-foreground-muted text-xs">Administra roles y accesos</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-surface border border-border p-4 rounded-xl mb-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center mr-3">
                                <Ionicons name="document-text" size={20} color="#3B82F6" />
                            </View>
                            <View>
                                <Text className="text-foreground font-bold">Documentación Legal</Text>
                                <Text className="text-foreground-muted text-xs">{venue.company_tax_id || 'No registrada'}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const InfoRow = ({ label, value, isLink, capitalize }: { label: string; value: string | number; isLink?: boolean; capitalize?: boolean }) => (
    <View className="flex-row justify-between py-2 border-b border-border/10 last:border-0">
        <Text className="text-foreground-muted w-1/3">{label}</Text>
        <Text className={`text-foreground font-medium flex-1 text-right  ${isLink ? 'text-blue-400 underline' : ''} ${capitalize ? 'capitalize' : ''}`}>
            {value}
        </Text>
    </View>
);

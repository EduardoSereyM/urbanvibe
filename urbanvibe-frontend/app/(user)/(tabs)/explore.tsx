import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, BackHandler, Image, Dimensions, TextInput, ScrollView } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SelectedVenueCard } from '../../../src/components/map/SelectedVenueCard';
import { useExploreContext } from '../../../src/hooks/useExplore';
import type { VenueMapItem } from '../../../src/types'; // Updated type usage
import QRScannerModal from '../../../src/components/QRScannerModal';
import { ExitConfirmationModal } from '../../../src/components/ExitConfirmationModal';
import { ContactModal } from '../../../src/components/ContactModal';
import { supabase } from '../../../src/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { client } from '../../../src/api/client';

// Pin Estático para máximo rendimiento
const PIN_UV = require("../../../assets/images/Pin_UV. 42x42.png");

const INITIAL_REGION = {
    latitude: -33.435,
    longitude: -70.630,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
};

// JSON de Estilo Oscuro "Electric Night"
const mapCustomStyle = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#1B1D37" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#1B1D37"
            },
            {
                "weight": 2
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#F2F1F0"
            }
        ]
    },

    {
        "featureType": "poi",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "transit",
        "stylers": [{ "visibility": "simplified" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#2a3055ff" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#083D77" }]
    }
];

export default function ExploreScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);

    // BFF Hook: Single source of truth for loading state
    const { data: context, isLoading, error, refetch } = useExploreContext();

    // Derived state
    const venues = context?.map_venues || [];
    const profileData = context?.profile;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVenue, setSelectedVenue] = useState<VenueMapItem | null>(null);

    // Notifications Count
    const { data: unreadData, refetch: refetchUnread } = useQuery({
        queryKey: ['unread-count'],
        queryFn: async () => {
            try {
                const res = await client.get('/notifications/unread-count');
                return res.data;
            } catch (e) { return { count: 0 }; }
        },
        refetchInterval: 15000
    });

    // Refresh count on focus
    useFocusEffect(
        useCallback(() => {
            refetchUnread();
        }, [])
    );

    // DEEP LINK LOGIC: Auto-select venue from Params
    useEffect(() => {
        if (params.venueId && venues.length > 0) {
            const targetId = params.venueId as string;
            const targetVenue = venues.find(v => v.id === targetId);

            if (targetVenue) {
                console.log(`📍 [EXPLORE] Deep link a local: ${targetVenue.name}`);

                // 1. Set Selected Venue Card
                setSelectedVenue(targetVenue);

                // 2. Animate Map
                setTimeout(() => {
                    mapRef.current?.animateToRegion({
                        latitude: targetVenue.latitude,
                        longitude: targetVenue.longitude,
                        latitudeDelta: 0.005, // Zoom más cercano
                        longitudeDelta: 0.005,
                    }, 1000);
                }, 500); // Small delay to ensure map is ready
            }
        }
    }, [params.venueId, venues]);

    // DEBUG: Log para diagnosticar
    React.useEffect(() => {
        if (context) {
            console.log('🔍 DEBUG - Context recibido:', {
                hasContext: !!context,
                mapVenuesCount: context.map_venues?.length || 0,
                firstVenue: context.map_venues?.[0]?.name || 'N/A',
                profile: context.profile?.username || 'null'
            });
        }
    }, [context]);
    const [scannerVisible, setScannerVisible] = useState(false);
    const [exitModalVisible, setExitModalVisible] = useState(false);
    const [contactModalVisible, setContactModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);


    useFocusEffect(
        useCallback(() => {
            console.log("📱 [PANTALLA ACTUAL]: /explore (Mapa)");
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (selectedVenue) {
                    setSelectedVenue(null);
                    return true;
                }
                setExitModalVisible(true);
                return true;
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => backHandler.remove();
        }, [selectedVenue])
    );

    const handleExit = () => {
        setExitModalVisible(false);
        BackHandler.exitApp();
    };

    const handleCheckinSuccess = () => {
        setSuccessMessage("¡Check-in exitoso! Has ganado puntos.");
        setTimeout(() => setSuccessMessage(null), 15000);
    };

    // Filter valid venues AND Apply Search
    const markers = React.useMemo(() => {
        return venues
            .filter(v => v.latitude && v.longitude)
            .filter(v => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                    v.name.toLowerCase().includes(q) ||
                    (v.category_name && v.category_name.toLowerCase().includes(q))
                );
            })
            .map((venue) => ({
                id: venue.id,
                venue: venue,
                coordinate: {
                    latitude: Number(venue.latitude),
                    longitude: Number(venue.longitude),
                },
            }));
    }, [venues, searchQuery]);

    useEffect(() => {
        if (!isLoading) {
            console.log(`🗺️ [EXPLORE] Renderizando mapa con ${markers.length} locales válidos. BFF Loaded.`);
        }
    }, [markers.length, isLoading]);

    if (isLoading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#FA4E35" />
                <Text className="text-foreground-muted font-body mt-4">Cargando mapa...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 bg-background items-center justify-center p-6">
                <Text className="text-error font-brand text-xl mb-4">Error al cargar locales</Text>
                <Text className="text-foreground-muted font-body text-center mb-6">
                    {error instanceof Error ? error.message : 'Error desconocido'}
                </Text>
                <TouchableOpacity
                    onPress={() => refetch()}
                    className="bg-primary px-6 py-3 rounded-full"
                >
                    <Text className="text-primary-foreground font-brand">Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <StatusBar style="light" />
            <ExitConfirmationModal
                visible={exitModalVisible}
                onCancel={() => setExitModalVisible(false)}
                onLogout={async () => {
                    setExitModalVisible(false);
                    await supabase.auth.signOut();
                    router.replace('/(auth)/login');
                }}
                onExit={handleExit}
            />

            <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
                style={{ flex: 1 }}
                initialRegion={INITIAL_REGION}
                showsUserLocation
                showsMyLocationButton={false}
                customMapStyle={mapCustomStyle}
                onPress={() => {
                    if (selectedVenue) setSelectedVenue(null);
                }}
            >
                {markers.map(({ id, venue, coordinate }) => (
                    <Marker
                        key={id}
                        coordinate={coordinate}
                        image={PIN_UV}
                        anchor={{ x: 0.5, y: 1 }}
                        onPress={() => setSelectedVenue(venue)}
                    >
                        <Callout tooltip onPress={() => setSelectedVenue(venue)}>
                            <View style={{
                                backgroundColor: "#1B1D37",
                                padding: 12,
                                borderRadius: 12,
                                borderColor: "rgba(255,255,255,0.2)",
                                borderWidth: 1,
                                width: 200,
                                alignItems: "center"
                            }}>
                                <Text style={{ color: "white", fontWeight: "bold", marginBottom: 4 }}>{venue.name}</Text>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Ionicons name="star" size={12} color="#F59E0B" />
                                    <Text style={{ color: "#ccc", fontSize: 12, marginLeft: 4 }}>
                                        {venue.rating_average ? venue.rating_average.toFixed(1) : 'N/A'}
                                    </Text>
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {/* Header Flotante: Buscador + Filtros */}
            <View
                className="absolute left-0 right-0 z-50 px-4"
                style={{ top: insets.top + 20 }}
            >
                {/* Header: Greeting + Search */}
                {/* Header: Greeting + Search */}
                <View className="mb-3">
                    {/* Greeting Section */}
                    {/* CAPSULA PRINCIPAL: Fondo abarca todo */}
                    <View className="mt-4 bg-[#232959]/90 px-4 py-3 rounded-2xl shadow-lg border border-white/10">

                        {/* ROW SUPERIOR: Avatar + Hola + Nombre */}
                        <View className="flex-row items-center mb-2">
                            {profileData?.avatar_url ? (
                                <Image
                                    source={{ uri: profileData.avatar_url }}
                                    className="w-8 h-8 rounded-full mr-2"
                                />
                            ) : (
                                <View className="w-8 h-8 rounded-full mr-2 bg-white/10 items-center justify-center border border-white/10">
                                    <Ionicons name="person" size={16} color="#F2F1F0" />
                                </View>
                            )}

                            <Text className="text-foreground font-brand text-xl shadow-lg mr-2">
                                Hola
                            </Text>
                            <Text className="text-primary font-brand text-xl ml-1 shadow-lg">
                                {profileData?.username || 'Viajero'} ✌️
                            </Text>

                            {/* Beta Tag - Right Aligned */}
                            {/* Beta Tag Removed */}
                        </View>

                        {/* ROW INFERIOR: Texto Pregunta */}
                        <Text className="text-accent-cyber font-brand text-sm shadow-lg opacity-90 pl-1">
                            ¿Dónde será nuestra próxima aventura?
                        </Text>
                    </View>


                    {/* Search Bar Real */}
                    <View className="bg-surface/90 backdrop-blur-md flex-row items-center px-4 py-3 mt-6 rounded-2xl border border-surface-active shadow-lg">
                        <Ionicons name="search" size={20} color="#F2F1F0" />
                        <TextInput
                            className="flex-1 ml-3 text-foreground font-body text-base"
                            placeholder="¿Qué buscas hoy?"
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#F2F1F0" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Filter Chips Menu superior*/}
            {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    <TouchableOpacity className="bg-primary/20 border border-primary px-4 py-2 rounded-full mr-2 flex-row items-center">
                        <Text className="mr-1">🔥</Text>
                        <Text className="text-primary font-body-bold text-xs">Trending</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-surface/90 border border-surface-active px-4 py-2 rounded-full mr-2 flex-row items-center">
                        <Text className="mr-1">🍸</Text>
                        <Text className="text-foreground font-body text-xs">Tragos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-surface/90 border border-surface-active px-4 py-2 rounded-full mr-2 flex-row items-center">
                        <Text className="mr-1">🍽️</Text>
                        <Text className="text-foreground font-body text-xs">Cena</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-surface/90 border border-surface-active px-4 py-2 rounded-full mr-2 flex-row items-center">
                        <Text className="mr-1">🎵</Text>
                        <Text className="text-foreground font-body text-xs">Música</Text>
                    </TouchableOpacity>
                </ScrollView> */}


            {/* Success Banner */}
            {
                successMessage && (
                    <View
                        className="absolute bg-success p-4 rounded-xl shadow-lg z-50 flex-row items-center"
                        style={{ top: insets.top + 130, left: 16, right: 16 }}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="white" />
                        <Text className="text-white font-body-bold ml-2 flex-1">
                            {successMessage}
                        </Text>
                        <TouchableOpacity onPress={() => setSuccessMessage(null)}>
                            <Ionicons name="close" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )
            }

            {
                selectedVenue && (
                    <View className="absolute bottom-0 left-0 right-0 p-4 z-40">
                        <SelectedVenueCard
                            venue={selectedVenue as any}
                            onClose={() => setSelectedVenue(null)}
                        />
                    </View>
                )
            }

            {/* FAB Scanner Button - Bottom Right (Thumb Zone) */}
            <View className="absolute right-2 top-1/2 items-center">
                <TouchableOpacity
                    onPress={() => setScannerVisible(true)}
                    className="bg-primary h-14 w-14 rounded-full items-center justify-center shadow-lg border-2 border-background"
                    style={{ elevation: 5 }}
                >
                    <Ionicons name="qr-code" size={24} color="#F2F1F0" />
                </TouchableOpacity>
                <Text className="text-accent-cyber font-body-bold mt-1">Check-in</Text>
            </View>

            <QRScannerModal
                visible={scannerVisible}
                onClose={() => setScannerVisible(false)}
                onCheckinSuccess={handleCheckinSuccess}
            />

            <ContactModal
                visible={contactModalVisible}
                onClose={() => setContactModalVisible(false)}
            />
        </View >
    );
}

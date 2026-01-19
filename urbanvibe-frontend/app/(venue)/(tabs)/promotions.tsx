import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useVenueContext } from '../../../src/context/VenueContext';
import { useVenuePromotions, useVenuePointsLogs } from '../../../src/hooks/usePromotions';
import { useAdminVenueDetail } from '../../../src/hooks/useAdminVenues';
import { PromotionCard } from '../../../src/components/promotions/PromotionCard';
import { CreatePromotionModal } from '../../../src/components/promotions/CreatePromotionModal';

export default function PromotionsScreen() {
    const router = useRouter();
    const { currentVenueId } = useVenueContext();
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'history'>('active');

    const { data: promotions, isLoading, refetch } = useVenuePromotions(currentVenueId || '');
    const { data: venue } = useAdminVenueDetail(currentVenueId || '');

    // In a real app, you'd fetch logs here too for the balance card history
    // const { data: pointsLogs } = useVenuePointsLogs(currentVenueId || '');

    if (!currentVenueId) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <Text className="text-foreground font-body">No se ha seleccionado un local.</Text>
            </SafeAreaView>
        );
    }

    const filteredPromotions = promotions?.filter(p => {
        if (filter === 'active') return p.is_active;
        if (filter === 'history') return !p.is_active;
        return true;
    });

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Banner En Construcción */}
            <View className="bg-warning/10 border border-warning/30 p-3 rounded-xl mx-4 mt-4 mb-6 flex-row items-center">
                <Ionicons name="construct-outline" size={24} color="#F59E0B" />
                <View className="ml-3 flex-1">
                    <Text className="text-warning font-bold text-sm uppercase">En Construcción</Text>
                    <Text className="text-foreground-muted text-xs">Estamos mejorando la gestión de tus promociones.</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-4 pt-4"
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FA4E35" />}
            >
                {/* Header & Balance */}
                <View className="mb-6">
                    <Text className="font-brand text-3xl text-foreground mb-4">Promociones</Text>



                    <TouchableOpacity
                        onPress={() => router.push('/(venue)/validate-reward')}
                        className="bg-accent-cyber p-4 rounded-xl flex-row items-center justify-center gap-2 mb-6 shadow-lg shadow-accent-cyber/20"
                    >
                        <Ionicons name="scan-outline" size={24} color="black" />
                        <Text className="text-black font-brand-bold text-lg">VALIDAR RECOMPENSA</Text>
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                <View className="flex-row mb-4 gap-2">
                    <TouchableOpacity
                        onPress={() => setFilter('active')}
                        className={`px-4 py-2 rounded-full border ${filter === 'active' ? 'bg-primary border-primary' : 'bg-transparent border-surface-active'}`}
                    >
                        <Text className={`font-body-bold ${filter === 'active' ? 'text-white' : 'text-foreground-muted'}`}>Activas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setFilter('history')}
                        className={`px-4 py-2 rounded-full border ${filter === 'history' ? 'bg-primary border-primary' : 'bg-transparent border-surface-active'}`}
                    >
                        <Text className={`font-body-bold ${filter === 'history' ? 'text-white' : 'text-foreground-muted'}`}>Historial</Text>
                    </TouchableOpacity>
                </View>

                {/* List */}
                <View className="pb-24">
                    {filteredPromotions?.map(promo => (
                        <PromotionCard
                            key={promo.id}
                            promotion={promo}
                            onBoost={() => { /* Implement Boost Logic */ }}
                        />
                    ))}

                    {!isLoading && filteredPromotions?.length === 0 && (
                        <Text className="text-foreground-muted text-center mt-8 font-body">
                            No hay promociones en esta sección.
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                onPress={() => setIsCreateModalVisible(true)}
                className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-primary/40"
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

            <CreatePromotionModal
                visible={isCreateModalVisible}
                onClose={() => {
                    setIsCreateModalVisible(false);
                    refetch();
                }}
                venueId={currentVenueId}
            />
        </SafeAreaView>
    );
}

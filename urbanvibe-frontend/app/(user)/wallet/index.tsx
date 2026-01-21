
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyWallet } from '../../../src/hooks/usePromotions';
import { useSocial } from '../../../src/hooks/useSocial';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function WalletScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');

    // Hooks
    const { data: walletItems, isLoading: isLoadingWallet, refetch: refetchWallet } = useMyWallet();
    const { usePointHistory, usePointStats } = useSocial();
    const { data: history, isLoading: isLoadingHistory, refetch: refetchHistory } = usePointHistory();
    const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = usePointStats();

    const isLoading = isLoadingWallet || isLoadingStats || (activeTab === 'history' && isLoadingHistory);

    const onRefresh = async () => {
        await Promise.all([refetchWallet(), refetchStats(), refetchHistory()]);
    };

    const renderHeader = () => (
        <View className="px-6 pt-4 pb-6">
            <Text className="text-foreground font-brand text-3xl mb-6">Mi Billetera</Text>

            {/* Points Card */}
            <LinearGradient
                colors={['#FA4E35', '#BD3A28']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-[32px] p-6 shadow-xl mb-6"
            >
                <View className="flex-row justify-between items-start mb-4">
                    <View>
                        <Text className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Balance Actual</Text>
                        <Text className="text-white font-brand text-4xl">{stats?.points_current || 0}</Text>
                        <Text className="text-white/80 text-[10px] mt-1">Puntos UrbanVibe</Text>
                    </View>
                    <View className="bg-white/20 p-3 rounded-2xl">
                        <Ionicons name="flash" size={24} color="white" />
                    </View>
                </View>

                {/* Progress Level */}
                <View className="mt-4">
                    <View className="flex-row justify-between items-end mb-2">
                        <Text className="text-white font-bold text-sm">{stats?.level_name || 'Bronce'}</Text>
                        <Text className="text-white/70 text-[10px]">Próximo: {stats?.next_level_name || 'Desconocido'}</Text>
                    </View>
                    <View className="h-2 bg-black/20 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-white rounded-full"
                            style={{ width: `${(stats?.progress_to_next_level || 0) * 100}%` }}
                        />
                    </View>
                    <Text className="text-white/60 text-[10px] mt-2 text-right">
                        {stats?.next_level_points ? `Faltan ${stats.next_level_points - stats.reputation_score} pts para subir` : '¡Nivel Máximo!'}
                    </Text>
                </View>
            </LinearGradient>

            {/* Stats row */}
            <View className="flex-row gap-4 mb-8">
                <View className="flex-1 bg-surface-active p-4 rounded-3xl border border-white/5">
                    <Text className="text-foreground-muted text-[10px] uppercase font-bold mb-1">Ganados</Text>
                    <Text className="text-foreground font-brand text-xl">+{stats?.points_lifetime || 0}</Text>
                </View>
                <View className="flex-1 bg-surface-active p-4 rounded-3xl border border-white/5">
                    <Text className="text-foreground-muted text-[10px] uppercase font-bold mb-1">Reputación</Text>
                    <Text className="text-foreground font-brand text-xl">{stats?.reputation_score || 0}</Text>
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row bg-surface-active p-1 rounded-2xl">
                <TouchableOpacity
                    onPress={() => setActiveTab('rewards')}
                    className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'rewards' ? 'bg-surface border border-white/5' : ''}`}
                >
                    <Text className={`font-bold text-sm ${activeTab === 'rewards' ? 'text-primary' : 'text-foreground-muted'}`}>Recompensas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('history')}
                    className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'history' ? 'bg-surface border border-white/5' : ''}`}
                >
                    <Text className={`font-bold text-sm ${activeTab === 'history' ? 'text-primary' : 'text-foreground-muted'}`}>Historial</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderRewardItem = ({ item }: { item: any }) => (
        <View className="bg-surface p-5 rounded-[32px] border border-white/5 mb-4 mx-6">
            <View className="flex-row justify-between mb-4">
                <View className="flex-1">
                    <Text className="text-primary text-[10px] font-bold uppercase mb-1">{item.venue_name}</Text>
                    <Text className="text-foreground font-brand text-lg" numberOfLines={2}>{item.promotion_title}</Text>
                </View>
                <View className="bg-success/10 px-3 py-1 rounded-full h-fit border border-success/20">
                    <Text className="text-success text-[10px] font-bold uppercase">{item.status}</Text>
                </View>
            </View>

            <View className="items-center bg-white p-6 rounded-3xl mb-4">
                <QRCode value={item.qr_content} size={160} />
            </View>

            <View className="flex-row items-center justify-between opacity-60">
                <View className="flex-row items-center gap-1">
                    <Ionicons name="time-outline" size={14} color="#F2F1F0" />
                    <Text className="text-foreground text-[10px]">
                        Canjeado {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => item.venue_id && router.push(`/(user)/venue/${item.venue_id}`)}>
                    <Text className="text-primary text-[10px] font-bold">Ver Local →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderHistoryItem = ({ item }: { item: any }) => {
        const isPositive = item.points >= 0;
        const iconName = item.event_code.includes('INVITE') ? 'people' :
            item.event_code.includes('CHECKIN') ? 'location' :
                item.event_code.includes('REWARD') ? 'gift' : 'flash';

        return (
            <View className="flex-row items-center justify-between mb-6 px-6">
                <View className="flex-row items-center gap-4 flex-1">
                    <View className="w-12 h-12 bg-surface-active rounded-2xl items-center justify-center border border-white/5">
                        <Ionicons name={iconName} size={20} color={isPositive ? '#FA4E35' : '#9CA3AF'} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-foreground font-bold text-sm" numberOfLines={1}>
                            {item.event_code.replace(/_/g, ' ')}
                        </Text>
                        <Text className="text-foreground-muted text-[10px]">
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                        </Text>
                    </View>
                </View>
                <Text className={`font-brand text-lg ${isPositive ? 'text-success' : 'text-foreground-muted'}`}>
                    {isPositive ? `+${item.points}` : item.points}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <FlatList
                data={activeTab === 'rewards' ? walletItems : history}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                renderItem={activeTab === 'rewards' ? renderRewardItem : renderHistoryItem}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#FA4E35" />
                }
                ListEmptyComponent={
                    <View className="items-center justify-center py-20 opacity-30 mt-10">
                        <Ionicons name={activeTab === 'rewards' ? "ticket-outline" : "list-outline"} size={64} color="white" />
                        <Text className="text-white text-lg mt-4 font-brand">No hay nada aquí aún</Text>
                        <Text className="text-foreground-muted text-center mt-2 px-8">
                            {activeTab === 'rewards'
                                ? "Canjea tus puntos por recompensas increíbles en tus locales favoritos."
                                : "Tus actividades aparecerán aquí a medida que ganes puntos."}
                        </Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 120 }}
            />
        </SafeAreaView>
    );
}


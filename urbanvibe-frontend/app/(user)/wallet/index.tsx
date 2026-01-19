
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyWallet } from '../../../src/hooks/usePromotions';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'expo-router';

export default function WalletScreen() {
    const { data: walletItems, isLoading, refetch } = useMyWallet();
    const router = useRouter();

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-surface p-4 rounded-xl border border-white/10 mb-4">
            <View className="flex-row justify-between mb-2">
                <Text className="text-foreground font-brand text-lg flex-1 mr-2">{item.venue_name}</Text>
                <View className="bg-success/20 px-2 py-1 rounded-lg">
                    <Text className="text-success text-xs font-bold uppercase">{item.status}</Text>
                </View>
            </View>

            <Text className="text-foreground-muted text-sm mb-4">
                {item.promotion_title.length > 40 ? item.promotion_title.substring(0, 40) + "..." : item.promotion_title}
            </Text>

            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <Ionicons name="time-outline" size={16} color="#606270" />
                    <Text className="text-foreground-muted text-xs">
                        Canjeado {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => item.venue_id && router.push(`/(user)/venue/${item.venue_id}`)}
                    className="flex-row items-center"
                >
                    <Text className="text-primary text-xs font-bold mr-1">Ir al Local</Text>
                    <Ionicons name="chevron-forward" size={14} color="#FA4E35" />
                </TouchableOpacity>
            </View>

            {/* Expander for QR Code - Simplificado: Siempre visible si es wallet */}
            <View className="mt-4 items-center bg-white p-4 rounded-xl">
                <QRCode value={item.qr_content} size={150} />
                <Text className="text-black text-xs mt-2 text-center">Muestra este código al personal</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background p-4">
            <View className="flex-row items-center justify-between mb-2 mt-2">
                <Text className="text-foreground font-brand text-3xl">Mi Billetera</Text>
                <TouchableOpacity onPress={() => refetch()} className="bg-surface-active p-2 rounded-full">
                    <Ionicons name="refresh" size={20} color="#FA4E35" />
                </TouchableOpacity>
            </View>

            {/* Construction Banner */}
            <View className="bg-warning/10 border border-warning/30 p-3 rounded-xl mb-4 flex-row items-center">
                <Ionicons name="construct-outline" size={20} color="#F59E0B" />
                <View className="ml-3 flex-1">
                    <Text className="text-warning font-bold text-xs uppercase">En Construcción</Text>
                    <Text className="text-foreground-muted text-xs">Estamos mejorando la experiencia de tus promociones. Pronto verás cambios.</Text>
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#FA4E35" />
                </View>
            ) : (
                <FlatList
                    data={walletItems}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20 opacity-50">
                            <Ionicons name="wallet-outline" size={64} color="white" />
                            <Text className="text-white text-lg mt-4 font-brand">Tu billetera está vacía</Text>
                            <Text className="text-foreground-muted text-center mt-2 px-8">
                                Explora locales y canjea tus puntos por recompensas increíbles.
                            </Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}
        </SafeAreaView>
    );
}

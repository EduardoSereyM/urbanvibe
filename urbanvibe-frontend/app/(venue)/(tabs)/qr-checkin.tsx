import React, { useRef, useState } from 'react';
import { Text, View, ActivityIndicator, TouchableOpacity, Share, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useVenueContext } from '../../../src/context/VenueContext';
import { useVenueQR } from '../../../src/hooks/useVenueQR';
import { useVenueCheckins, useConfirmCheckin } from '../../../src/hooks/useAdminVenues';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CheckinManagerScreen() {
    const { currentVenueId } = useVenueContext();
    const [activeTab, setActiveTab] = useState<'qr' | 'history'>('history'); // Default to history for quicker access

    // QR Data
    const { data: qrData, isLoading: qrLoading, refetch: refetchQr } = useVenueQR(currentVenueId);

    // History Data
    const { data: checkinsData, isLoading: historyLoading, refetch: refetchHistory, isRefetching } = useVenueCheckins(currentVenueId || '');
    const confirmMutation = useConfirmCheckin();

    const qrRef = useRef<any>(null);

    const onRefresh = async () => {
        if (activeTab === 'qr') await refetchQr();
        else await refetchHistory();
    };

    if (!currentVenueId) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center p-6">
                <Ionicons name="alert-circle-outline" size={64} color="#828BA0" />
                <Text className="text-foreground font-brand text-xl mt-4 text-center">No hay local seleccionado</Text>
            </SafeAreaView>
        );
    }

    const renderHistoryItem = ({ item }: { item: any }) => (
        <View className="flex-row items-center justify-between p-4 bg-surface mb-2 rounded-xl border border-border">
            <View className="flex-1 mr-4">
                <Text className="text-foreground font-bold text-lg">{item.user_display_name}</Text>
                <Text className="text-foreground-muted text-xs">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                </Text>
                {item.geofence_passed && (
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="location" size={12} color="#22C55E" />
                        <Text className="text-green-500 text-[10px] ml-1">En zona</Text>
                    </View>
                )}
            </View>

            <View>
                {item.status === 'pending' ? (
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => confirmMutation.mutate({ venueId: currentVenueId, checkinId: item.id })} // Assuming confirm implies 'approved'
                            className="bg-primary px-4 py-2 rounded-full"
                        >
                            <Text className="text-white font-bold text-xs">Validar</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className={`px-3 py-1 rounded-full ${item.status === 'confirmed' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        <Text className={`font-bold text-xs ${item.status === 'confirmed' ? 'text-green-500' : 'text-red-500'}`}>
                            {item.status === 'confirmed' ? 'VALIDADO' : 'RECHAZADO'}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 pt-4 pb-4">
                <Text className="text-foreground font-brand text-3xl mb-1">Check-ins</Text>
                <Text className="text-foreground-muted font-body text-sm">Gestiona o muestra tu código QR</Text>
            </View>

            {/* Tabs */}
            <View className="flex-row px-6 mb-6 gap-4">
                <TouchableOpacity
                    onPress={() => setActiveTab('history')}
                    className={`flex-1 py-3 rounded-xl items-center border ${activeTab === 'history' ? 'bg-surface-highlight border-primary' : 'bg-surface border-border'}`}
                >
                    <Text className={`font-bold ${activeTab === 'history' ? 'text-primary' : 'text-foreground-muted'}`}>Historial</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('qr')}
                    className={`flex-1 py-3 rounded-xl items-center border ${activeTab === 'qr' ? 'bg-surface-highlight border-primary' : 'bg-surface border-border'}`}
                >
                    <Text className={`font-bold ${activeTab === 'qr' ? 'text-primary' : 'text-foreground-muted'}`}>Tu Código QR</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="flex-1 bg-background px-4">
                {activeTab === 'qr' ? (
                    <View className="flex-1 items-center justify-center">
                        {qrLoading ? (
                            <ActivityIndicator size="large" color="#FA4E35" />
                        ) : (
                            <View className="items-center w-full">
                                <View className="bg-white p-6 rounded-3xl shadow-xl mb-8">
                                    {qrData?.qr_content ? (
                                        <QRCode value={qrData.qr_content} size={250} />
                                    ) : (
                                        <Text>Error cargando QR</Text>
                                    )}
                                </View>
                                <Text className="text-foreground-muted text-center px-8">
                                    Muestra este código a tus clientes para que registren su visita.
                                </Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <FlatList
                        data={checkinsData?.checkins || []} // Assuming response structure
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderHistoryItem}
                        refreshControl={<RefreshControl refreshing={historyLoading || isRefetching} onRefresh={onRefresh} tintColor="#FA4E35" />}
                        ListEmptyComponent={
                            <View className="items-center py-12">
                                <Ionicons name="people-outline" size={48} color="#3F3F46" />
                                <Text className="text-foreground-muted mt-4">No hay check-ins recientes.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

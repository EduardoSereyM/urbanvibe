import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    RefreshControl,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSocial } from '../../../src/hooks/useSocial';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const { width } = Dimensions.get('window');

export default function VenueInvitationsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

    const {
        useSentVenueInvitations,
        useReceivedVenueInvitations,
        useHandleVenueInvitation
    } = useSocial();

    const { data: sent, isLoading: isLoadingSent, refetch: refetchSent } = useSentVenueInvitations();
    const { data: received, isLoading: isLoadingReceived, refetch: refetchReceived } = useReceivedVenueInvitations();
    const handleMutation = useHandleVenueInvitation();

    const isLoading = activeTab === 'sent' ? isLoadingSent : isLoadingReceived;
    const invitations = activeTab === 'sent' ? sent : received;

    const onRefresh = async () => {
        if (activeTab === 'sent') await refetchSent();
        else await refetchReceived();
    };

    return (
        <SafeAreaView className="flex-1 bg-background pt-10">
            {/* Header */}
            <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-surface-active">
                    <Ionicons name="arrow-back" size={24} color="#F2F1F0" />
                </TouchableOpacity>
                <Text className="font-brand text-2xl text-foreground">Invitaciones a Locales</Text>
                <View className="w-10" />
            </View>

            {/* Tabs */}
            <View className="flex-row px-6 mt-6 border-b border-white/5">
                <TouchableOpacity
                    onPress={() => setActiveTab('received')}
                    className={`pb-4 mr-8 ${activeTab === 'received' ? 'border-b-2 border-primary' : ''}`}
                >
                    <Text className={`font-brand text-lg ${activeTab === 'received' ? 'text-foreground' : 'text-foreground-muted'}`}>
                        Recibidas
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('sent')}
                    className={`pb-4 ${activeTab === 'sent' ? 'border-b-2 border-primary' : ''}`}
                >
                    <Text className={`font-brand text-lg ${activeTab === 'sent' ? 'text-foreground' : 'text-foreground-muted'}`}>
                        Enviadas
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-6 mt-4"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading && !!invitations?.length}
                        onRefresh={onRefresh}
                        tintColor="#FA4E35"
                    />
                }
            >
                {isLoading && !invitations?.length ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator color="#FA4E35" size="large" />
                    </View>
                ) : (invitations && invitations.length > 0) ? (
                    invitations.map((inv) => (
                        <InvitationCard
                            key={inv.id}
                            item={inv}
                            isSent={activeTab === 'sent'}
                            onAction={(action) => handleMutation.mutate({ invitationId: inv.id, action })}
                            isProcessing={handleMutation.isPending}
                        />
                    ))
                ) : (
                    <View className="items-center py-20 opacity-40">
                        <Ionicons name="mail-outline" size={64} color="#9CA3AF" />
                        <Text className="text-foreground-muted mt-4 font-body text-center">
                            No tienes {activeTab === 'sent' ? 'invitaciones enviadas' : 'invitaciones recibidas'} aún.
                        </Text>
                    </View>
                )}
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}

function InvitationCard({ item, isSent, onAction, isProcessing }: {
    item: any,
    isSent: boolean,
    onAction: (a: 'accept' | 'reject') => void,
    isProcessing: boolean
}) {
    const router = useRouter();
    const statusColors = {
        pending: 'text-primary',
        accepted: 'text-green-500',
        rejected: 'text-destructive',
    };

    const statusLabels = {
        pending: 'Pendiente',
        accepted: 'Aceptada',
        rejected: 'Rechazada',
    };

    return (
        <View className="bg-surface p-4 rounded-3xl mb-4 border border-surface-active">
            <View className="flex-row items-center justify-between mb-3">
                <TouchableOpacity
                    onPress={() => router.push(`/(user)/venue/${item.venue_id}`)}
                    className="flex-row items-center gap-2 flex-1"
                >
                    <View className="w-8 h-8 rounded-full bg-surface-active items-center justify-center">
                        <Ionicons name="storefront-outline" size={16} color="#FA4E35" />
                    </View>
                    <Text className="text-foreground font-brand text-lg" numberOfLines={1}>{item.venue_name}</Text>
                </TouchableOpacity>
                <View className="bg-surface-active px-2 py-1 rounded-lg">
                    <Text className={`text-[10px] font-bold uppercase ${statusColors[item.status as keyof typeof statusColors]}`}>
                        {statusLabels[item.status as keyof typeof statusColors]}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center gap-3 mb-4">
                <View className="w-10 h-10 rounded-full bg-surface-active items-center justify-center overflow-hidden">
                    <Ionicons name="person" size={20} color="#9CA3AF" />
                </View>
                <View className="flex-1">
                    <Text className="text-foreground-muted text-xs">
                        {isSent ? 'Invitaste a' : 'Invitación de'} <Text className="text-foreground font-bold">{item.sender_username}</Text>
                    </Text>
                    <Text className="text-foreground-muted text-[10px]">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                    </Text>
                </View>
            </View>

            {item.message && (
                <View className="bg-surface-active p-3 rounded-2xl mb-4">
                    <Text className="text-foreground-muted text-xs italic">
                        "{item.message}"
                    </Text>
                </View>
            )}

            {!isSent && item.status === 'pending' && (
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={() => onAction('reject')}
                        className="flex-1 bg-surface-active py-3 rounded-xl items-center"
                        disabled={isProcessing}
                    >
                        {isProcessing ? <ActivityIndicator size="small" color="#9CA3AF" /> : <Text className="text-foreground-muted font-bold">Rechazar</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onAction('accept')}
                        className="flex-1 bg-primary py-3 rounded-xl items-center"
                        disabled={isProcessing}
                    >
                        {isProcessing ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold">Aceptar</Text>}
                    </TouchableOpacity>
                </View>
            )}

            {item.status === 'accepted' && (
                <View className="bg-green-500/10 border border-green-500/20 py-3 rounded-xl items-center">
                    <Text className="text-green-500 font-bold">✓ Invitación Aceptada</Text>
                </View>
            )}

            {item.status === 'rejected' && (
                <View className="bg-destructive/10 border border-destructive/20 py-3 rounded-xl items-center">
                    <Text className="text-destructive font-bold">Invitación Rechazada</Text>
                </View>
            )}
        </View>
    );
}


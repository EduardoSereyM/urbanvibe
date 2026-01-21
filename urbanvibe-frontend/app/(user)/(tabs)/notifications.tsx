import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { client } from '../../../src/api/client';
import { useNotification } from '../../../src/context/NotificationContext';

interface NotificationItem {
    id: string;
    title: string;
    body: string;
    type: string;
    is_read: boolean;
    active: boolean;
    created_at: string;
    data?: any;
}

export default function NotificationsScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    // Podríamos usar el contexto para marcar cosas como leídas globalmente si quisiéramos
    const { } = useNotification();

    // 1. Fetch Notifications
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await client.get('/notifications/?limit=50');
            return response.data; // { items: [], total, ... }
        },
    });

    // 2. Fetch Unread Count
    const { data: unreadData, refetch: refetchUnread } = useQuery({
        queryKey: ['unread-count'],
        queryFn: async () => {
            const response = await client.get('/notifications/unread-count');
            return response.data; // { count: number }
        },
    });

    const notifications = Array.isArray(data) ? data : [];
    const unreadCount = unreadData?.count || 0;

    // 3. Mark as Read Mutation
    const markReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await client.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-count'] }); // Refresh badge
        },
    });

    const handlePress = (item: NotificationItem) => {
        if (!item.is_read) {
            markReadMutation.mutate(item.id);
        }

        // Navegación inteligente basada en 'data'
        if (item.data) {
            const { type, screen, venue_id, sender_id } = item.data;

            if (type === 'VENUE_INVITATION' || type === 'VENUE_INVITATION_ACCEPTED') {
                router.push('/(user)/community/invitations');
            } else if (type === 'FRIEND_REQUEST' || type === 'FRIEND_ACCEPTED') {
                router.push('/(user)/community');
            } else if (screen === 'venue-detail' && venue_id) {
                router.push(`/(user)/venue/${venue_id}`);
            } else if (screen === 'community') {
                router.push('/(user)/community');
            }
        }
    };

    const renderItem = ({ item }: { item: NotificationItem }) => {
        let iconName: any = 'information-circle';
        let iconColor = '#3b82f6'; // blue-500

        if (item.type === 'success') {
            iconName = 'checkmark-circle';
            iconColor = '#22c55e'; // green-500
        } else if (item.type === 'warning') {
            iconName = 'alert-circle';
            iconColor = '#f59e0b'; // yellow-500
        } else if (item.type === 'error') {
            iconName = 'close-circle';
            iconColor = '#ef4444'; // red-500
        }

        return (
            <TouchableOpacity
                onPress={() => handlePress(item)}
                className={`flex-row p-4 border-b border-white/5 ${item.is_read ? 'opacity-60' : 'bg-white/5'}`}
            >
                <View className="mr-4 mt-1">
                    <Ionicons name={iconName} size={24} color={iconColor} />
                </View>
                <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                        <Text className="text-white font-bold text-base mb-1">{item.title}</Text>
                        {!item.is_read && (
                            <View className="w-2 h-2 rounded-full bg-primary" />
                        )}
                    </View>
                    <Text className="text-gray-300 text-sm mb-2 leading-tight">{item.body}</Text>
                    <Text className="text-gray-500 text-xs">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-background">
            {/* Custom Header for Notifications */}
            <View className="bg-[#1B1D37] px-4 pb-4 pt-12 flex-row items-center border-b border-white/10 shadow-lg" style={{ paddingTop: 50 }}>
                <TouchableOpacity onPress={() => router.back()} className="mr-4 active:opacity-70 p-1">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-brand flex-1">Notificaciones</Text>
                {unreadCount > 0 && (
                    <View className="bg-primary px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">{unreadCount} nuevas</Text>
                    </View>
                )}
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#fa4e35" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={refetch}
                            tintColor="#fa4e35"
                            colors={['#fa4e35']}
                        />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center mt-20">
                            <Ionicons name="notifications-off-outline" size={64} color="#64748b" />
                            <Text className="text-gray-400 mt-4 text-lg">No tienes notificaciones</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

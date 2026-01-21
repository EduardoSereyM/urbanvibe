
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProfileContext } from '../../../src/hooks/useProfileContext';
import { useSocial, FriendListItem, GroupResponse, GroupInvitationResponse } from '../../../src/hooks/useSocial';

const { width } = Dimensions.get('window');

export default function CommunityScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('friends');

    // Hooks
    const { data: profileData, refetch: refetchProfile } = useProfileContext();
    const referralCode = profileData?.referral_code;

    const {
        useFriendsList,
        useHandleFriendRequest,
        useRemoveFriend,
        useMyGroups,
        useGroupInvitations,
        useHandleGroupInvitation
    } = useSocial();

    const { data: friends, isLoading: isLoadingFriends, refetch: refetchFriends } = useFriendsList();
    const { data: groups, isLoading: isLoadingGroups, refetch: refetchGroups } = useMyGroups();
    const { data: groupInvs, refetch: refetchGroupInvs } = useGroupInvitations();

    const handleFriendRequest = useHandleFriendRequest();
    const removeFriendMutation = useRemoveFriend();
    const handleGroupInv = useHandleGroupInvitation();

    const isLoading = isLoadingFriends || isLoadingGroups;
    const pendingTotal = (friends?.filter(f => !f.is_sender && f.status === 'pending').length || 0) + (groupInvs?.length || 0);

    const onRefresh = async () => {
        await Promise.all([refetchFriends(), refetchGroups(), refetchProfile(), refetchGroupInvs()]);
    };

    const handleCopyCode = () => {
        const { Clipboard } = require('react-native');
        Clipboard.setString(referralCode || '');
        Alert.alert('¡Copiado!', 'Tu código de invitación está listo para compartir.');
    };

    const renderHeader = () => (
        <View className="px-6 pt-4 pb-2">
            <View className="flex-row items-center justify-between mb-6">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-surface-active">
                    <Ionicons name="arrow-back" size={24} color="#F2F1F0" />
                </TouchableOpacity>
                <Text className="font-brand text-2xl text-foreground">Comunidad</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(user)/community/search')}
                    className="w-10 h-10 items-center justify-center rounded-full bg-primary/10"
                >
                    <Ionicons name="person-add" size={20} color="#FA4E35" />
                </TouchableOpacity>
            </View>

            {/* Quick Actions Card */}
            <TouchableOpacity
                onPress={() => router.push('/(user)/community/invitations')}
                className="bg-surface-active p-5 rounded-[32px] border border-white/5 flex-row items-center justify-between mb-6"
            >
                <View className="flex-row items-center gap-4">
                    <View className="bg-primary/20 p-3 rounded-full">
                        <Ionicons name="mail" size={24} color="#FA4E35" />
                    </View>
                    <View>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-foreground font-brand text-lg">Invitaciones</Text>
                            {pendingTotal > 0 && (
                                <View className="bg-primary px-2 py-0.5 rounded-full">
                                    <Text className="text-white text-[10px] font-bold">{pendingTotal}</Text>
                                </View>
                            )}
                        </View>
                        <Text className="text-foreground-muted text-xs">Locales y Grupos privados</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#606270" />
            </TouchableOpacity>

            {/* Tabs */}
            <View className="flex-row bg-surface-active p-1 rounded-2xl mb-8">
                <TouchableOpacity
                    onPress={() => setActiveTab('friends')}
                    className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'friends' ? 'bg-surface border border-white/5' : ''}`}
                >
                    <Text className={`font-bold text-sm ${activeTab === 'friends' ? 'text-primary' : 'text-foreground-muted'}`}>Amigos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('groups')}
                    className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'groups' ? 'bg-surface border border-white/5' : ''}`}
                >
                    <Text className={`font-bold text-sm ${activeTab === 'groups' ? 'text-primary' : 'text-foreground-muted'}`}>Grupos</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background pt-10" edges={['top']}>
            {renderHeader()}

            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor="#FA4E35" />}
            >
                {activeTab === 'friends' ? (
                    <View className="mb-10">
                        <View className="bg-primary/5 p-6 rounded-[32px] border border-primary/10 items-center mb-8">
                            <Text className="font-brand text-lg text-primary mb-1">Invita y Gana</Text>
                            <Text className="text-foreground-muted text-xs text-center mb-4">Ganan 100 pts ambos al registrarse con tu código</Text>
                            <TouchableOpacity
                                onPress={handleCopyCode}
                                className="bg-primary/20 flex-row items-center gap-3 px-6 py-3 rounded-2xl border border-primary/30"
                            >
                                <Text className="font-brand text-xl text-primary tracking-widest">{referralCode}</Text>
                                <Ionicons name="copy" size={16} color="#FA4E35" />
                            </TouchableOpacity>
                        </View>

                        {isLoadingFriends ? (
                            <ActivityIndicator color="#FA4E35" className="py-20" />
                        ) : friends && friends.length > 0 ? (
                            friends.map((item) => (
                                <FriendCard
                                    key={item.friendship_id}
                                    item={item}
                                    onAction={(action) => handleFriendRequest.mutate({ friendshipId: item.friendship_id, action })}
                                    onRemove={() => removeFriendMutation.mutate(item.friendship_id)}
                                    isProcessing={handleFriendRequest.isPending || removeFriendMutation.isPending}
                                    onOpenProfile={() => router.push(`/(user)/profile/public/${item.friend_id}`)}
                                />
                            ))
                        ) : (
                            <View className="items-center py-16 opacity-30">
                                <Ionicons name="people-outline" size={64} color="white" />
                                <Text className="text-white font-brand text-lg mt-4">Aún no tienes amigos</Text>
                                <Text className="text-foreground-muted text-center mt-2 px-8">Explora la comunidad y agrégalos usando su código UV.</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View className="mb-10">
                        {/* Group Invitations Sub-section */}
                        {groupInvs && groupInvs.length > 0 && (
                            <View className="mb-8">
                                <Text className="font-brand text-lg text-foreground mb-4">Invitaciones a Grupos</Text>
                                {groupInvs.map((inv: GroupInvitationResponse) => (
                                    <View key={inv.id} className="bg-surface p-4 rounded-2xl border border-primary/20 flex-row items-center justify-between mb-3">
                                        <View className="flex-1 mr-4">
                                            <Text className="text-foreground font-bold text-sm">{inv.group_name}</Text>
                                            <Text className="text-foreground-muted text-[10px]">De: {inv.inviter_username}</Text>
                                        </View>
                                        <View className="flex-row gap-2">
                                            <TouchableOpacity
                                                onPress={() => handleGroupInv.mutate({ invitationId: inv.id, action: 'reject' })}
                                                className="bg-surface-active p-2 rounded-lg"
                                            >
                                                <Ionicons name="close" size={18} color="#9CA3AF" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleGroupInv.mutate({ invitationId: inv.id, action: 'accept' })}
                                                className="bg-primary/20 p-2 rounded-lg"
                                            >
                                                <Ionicons name="checkmark" size={18} color="#FA4E35" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="font-brand text-xl text-foreground">Mis Grupos</Text>
                            <TouchableOpacity
                                onPress={() => Alert.alert('Próximamente', 'Estamos habilitando la creación de grupos. ¡Vuelve pronto!')}
                                className="bg-primary px-4 py-2 rounded-full"
                            >
                                <Text className="text-white text-xs font-bold">+ Crear</Text>
                            </TouchableOpacity>
                        </View>

                        {isLoadingGroups ? (
                            <ActivityIndicator color="#FA4E35" className="py-20" />
                        ) : (groups && groups.length > 0) ? (
                            groups.map((group: GroupResponse) => (
                                <TouchableOpacity
                                    key={group.id}
                                    onPress={() => router.push(`/(user)/community/groups/${group.id}`)}
                                    className="bg-surface p-4 rounded-[28px] border border-white/5 mb-4 flex-row items-center gap-4"
                                >
                                    <View className="w-14 h-14 bg-surface-active rounded-2xl items-center justify-center overflow-hidden">
                                        {group.avatar_url ? (
                                            <Image source={{ uri: group.avatar_url }} className="w-full h-full" />
                                        ) : (
                                            <Ionicons name="people" size={24} color="#FA4E35" />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-foreground font-brand text-lg" numberOfLines={1}>{group.name}</Text>
                                        <Text className="text-foreground-muted text-xs" numberOfLines={1}>{group.description || 'Sin descripción'}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="#606270" />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View className="items-center py-16 opacity-30">
                                <Ionicons name="duplicate-outline" size={64} color="white" />
                                <Text className="text-white font-brand text-lg mt-4">Comunidad Vacía</Text>
                                <Text className="text-foreground-muted text-center mt-2 px-8">Crea un grupo para coordinar tus próximas salidas con x1.5 puntos.</Text>
                            </View>
                        )}

                        {/* Bonus Info */}
                        <View className="mt-4 bg-success/10 p-4 rounded-3xl border border-success/20 flex-row gap-3 items-center">
                            <Ionicons name="flash" size={24} color="#10B981" />
                            <Text className="text-success text-[11px] flex-1 font-bold">
                                ¡RECUERDA! Hacer check-in grupal otorga bonificadores de x1.5 en puntos para todos los miembros.
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function FriendCard({ item, onAction, onRemove, onOpenProfile, isProcessing }: {
    item: FriendListItem,
    onAction: (a: 'accept' | 'reject') => void,
    onRemove: () => void,
    onOpenProfile: () => void,
    isProcessing: boolean
}) {
    const isPendingReceived = item.status === 'pending' && !item.is_sender;
    const isPendingSent = item.status === 'pending' && item.is_sender;

    const handleRemove = () => {
        Alert.alert(
            'Eliminar Amistad',
            `¿Estás seguro de que deseas eliminar a ${item.username} de tus amigos?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: onRemove }
            ]
        );
    };

    return (
        <View className="flex-row items-center justify-between bg-surface p-4 rounded-2xl mb-3 border border-white/5">
            <TouchableOpacity
                onPress={item.status === 'accepted' ? onOpenProfile : undefined}
                className="flex-row items-center flex-1"
                activeOpacity={item.status === 'accepted' ? 0.7 : 1}
            >
                {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} className="w-12 h-12 rounded-full bg-surface-active" />
                ) : (
                    <View className="w-12 h-12 rounded-full bg-surface-active items-center justify-center">
                        <Ionicons name="person" size={24} color="#FA4E35" />
                    </View>
                )}
                <View className="ml-4 flex-1">
                    <Text className="text-foreground font-brand text-base" numberOfLines={1}>{item.username}</Text>
                    <View className="flex-row items-center gap-1">
                        <View className={`w-2 h-2 rounded-full ${item.status === 'accepted' ? 'bg-success' : 'bg-warning'}`} />
                        <Text className="text-foreground-muted text-[10px] uppercase font-bold tracking-widest">
                            {item.status === 'accepted' ? 'Conectado' : 'Pendiente'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            {isPendingReceived ? (
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={() => onAction('accept')}
                        className="bg-primary/20 h-10 w-10 items-center justify-center rounded-xl border border-primary/30"
                        disabled={isProcessing}
                    >
                        <Ionicons name="checkmark" size={20} color="#FA4E35" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onAction('reject')}
                        className="bg-surface-active h-10 w-10 items-center justify-center rounded-xl"
                        disabled={isProcessing}
                    >
                        <Ionicons name="close" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            ) : item.status === 'accepted' ? (
                <TouchableOpacity onPress={onOpenProfile} className="bg-surface-active h-10 w-10 items-center justify-center rounded-xl">
                    <Ionicons name="chevron-forward" size={20} color="#FA4E35" />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={handleRemove} className="opacity-30 p-2">
                    <Ionicons name="trash-outline" size={18} color="#FA4E35" />
                </TouchableOpacity>
            )}
        </View>
    );
}


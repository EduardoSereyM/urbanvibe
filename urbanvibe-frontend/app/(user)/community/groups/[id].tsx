
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSocial, FriendListItem } from '../../../../src/hooks/useSocial';

export default function GroupDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [inviteModalVisible, setInviteModalVisible] = useState(false);

    const {
        useGroupDetails,
        useGroupMembers,
        useFriendsList,
        useInviteToGroup,
        useRemoveGroupMember
    } = useSocial();

    const { data: group, isLoading: isLoadingGroup } = useGroupDetails(id);
    const { data: members, isLoading: isLoadingMembers } = useGroupMembers(id);
    const { data: friends } = useFriendsList();
    const inviteMutation = useInviteToGroup();
    const removeMemberMutation = useRemoveGroupMember();

    const handleInvite = (friendId: string) => {
        inviteMutation.mutate({ groupId: id, inviteeId: friendId }, {
            onSuccess: () => {
                Alert.alert('Éxito', 'Invitación enviada correctamente');
                setInviteModalVisible(false);
            },
            onError: (error: any) => {
                Alert.alert('Error', error?.response?.data?.detail || 'No se pudo enviar la invitación');
            }
        });
    };

    const handleRemoveMember = (userId: string, username: string) => {
        const isSelf = userId === group?.creator_id;
        if (isSelf) {
            Alert.alert('Info', 'Como creador no puedes salirte directamente. Debes borrar el grupo o transferir el mando (Próximamente).');
            return;
        }

        Alert.alert(
            'Eliminar Miembro',
            `¿Estás seguro de que deseas eliminar a ${username} del grupo?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        removeMemberMutation.mutate({ groupId: id, userId }, {
                            onSuccess: () => Alert.alert('Éxito', 'Miembro eliminado'),
                            onError: (err: any) => Alert.alert('Error', err?.response?.data?.detail || 'No se pudo eliminar')
                        });
                    }
                }
            ]
        );
    };

    if (isLoadingGroup) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator color="#FA4E35" size="large" />
            </View>
        );
    }

    if (!group) return null;

    const [searchQuery, setSearchQuery] = useState('');
    const { useSearchUsers } = useSocial();
    const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery);

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {/* Header / Banner */}
            <View className="relative h-64 bg-surface-active">
                {group.avatar_url ? (
                    <Image source={{ uri: group.avatar_url }} className="w-full h-full opacity-60" />
                ) : (
                    <View className="w-full h-full items-center justify-center">
                        <Ionicons name="people" size={80} color="#FA4E35" opacity={0.2} />
                    </View>
                )}

                <View className="absolute top-4 left-6 flex-row items-center justify-between right-6">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-black/40">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-black/40">
                        <Ionicons name="settings-outline" size={22} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="absolute bottom-6 left-6 right-6">
                    <View className="bg-primary/20 self-start px-3 py-1 rounded-full border border-primary/30 mb-2">
                        <Text className="text-primary text-[10px] font-bold uppercase tracking-widest">Grupo Privado</Text>
                    </View>
                    <Text className="text-white font-brand text-3xl shadow-lg">{group.name}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                {/* Description */}
                <View className="mb-8">
                    <Text className="text-foreground-muted text-sm leading-relaxed">
                        {group.description || 'Este grupo aún no tiene una descripción. ¡Únete y empieza a coordinar tus salidas!'}
                    </Text>
                </View>

                {/* Benefits / Info */}
                <View className="bg-success/5 border border-success/20 p-5 rounded-[32px] mb-10 flex-row items-center gap-4">
                    <View className="bg-success/20 p-3 rounded-2xl">
                        <Ionicons name="flash" size={24} color="#10B981" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-success font-bold text-sm">Bono de Asistencia Grupal</Text>
                        <Text className="text-success/70 text-[11px]">Recuerda que asistir en conjunto otorga un multiplicador de x1.5 puntos.</Text>
                    </View>
                </View>

                {/* Members Section */}
                <View className="mb-20">
                    <View className="flex-row items-center justify-between mb-6">
                        <View>
                            <Text className="text-foreground font-brand text-xl">Miembros</Text>
                            <Text className="text-foreground-muted text-xs">{members?.length || 0} integrantes activos</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setInviteModalVisible(true)}
                            className="bg-primary px-4 py-2 rounded-full"
                        >
                            <Text className="text-white text-xs font-bold font-brand">+ Invitar</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoadingMembers ? (
                        <ActivityIndicator color="#FA4E35" size="small" />
                    ) : (
                        members?.map((member: any) => (
                            <View key={member.id} className="flex-row items-center justify-between mb-4 bg-surface-active p-3 rounded-2xl border border-white/5">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 rounded-full bg-surface-active overflow-hidden border border-white/10">
                                        {member.avatar_url ? (
                                            <Image source={{ uri: member.avatar_url }} className="w-full h-full" />
                                        ) : (
                                            <View className="flex-1 items-center justify-center">
                                                <Ionicons name="person" size={18} color="#9CA3AF" />
                                            </View>
                                        )}
                                    </View>
                                    <View className="ml-3">
                                        <Text className="text-foreground font-bold text-sm">{member.username}</Text>
                                        <Text className="text-foreground-muted text-[10px] uppercase font-bold tracking-widest">{member.role === 'admin' ? 'Fundador' : 'Miembro'}</Text>
                                    </View>
                                </View>
                                {group.creator_id === member.user_id ? (
                                    <View className="bg-primary/10 px-2 py-1 rounded-lg">
                                        <Ionicons name="shield-checkmark" size={14} color="#FA4E35" />
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => handleRemoveMember(member.user_id, member.username)}
                                        className="p-2"
                                    >
                                        <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Invite Friends Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={inviteModalVisible}
                onRequestClose={() => setInviteModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-background rounded-t-[40px] p-8 h-2/3">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-foreground font-brand text-2xl">Invitar al Grupo</Text>
                            <TouchableOpacity onPress={() => setInviteModalVisible(false)} className="bg-surface-active p-2 rounded-full">
                                <Ionicons name="close" size={24} color="#606270" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View className="bg-surface-active flex-row items-center px-4 py-3 rounded-2xl mb-6 border border-white/5">
                            <Ionicons name="search" size={20} color="#606270" />
                            <TextInput
                                placeholder="Buscar por UV-XXXXXX o Correo..."
                                placeholderTextColor="#606270"
                                className="flex-1 ml-3 text-foreground"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCapitalize="none"
                            />
                            {isSearching && <ActivityIndicator color="#FA4E35" size="small" className="ml-2" />}
                        </View>

                        <FlatList
                            data={(searchQuery.length > 3 ? searchResults : friends?.filter((f: FriendListItem) => f.status === 'accepted' && !members?.some((m: any) => m.user_id === f.friend_id))) as any[]}
                            keyExtractor={(item: any) => item.id || item.friend_id || item.friendship_id || Math.random().toString()}
                            renderItem={({ item }: { item: any }) => {
                                const userId = item.id || item.friend_id;
                                const isAlreadyMember = members?.some((m: any) => m.user_id === userId);

                                return (
                                    <View className="flex-row items-center justify-between mb-4 bg-surface-active p-4 rounded-3xl">
                                        <View className="flex-row items-center flex-1">
                                            <View className="w-10 h-10 rounded-full bg-surface items-center justify-center overflow-hidden">
                                                {item.avatar_url ? <Image source={{ uri: item.avatar_url }} className="w-full h-full" /> : <Ionicons name="person" size={20} color="#FA4E35" />}
                                            </View>
                                            <View className="ml-3 flex-1">
                                                <Text className="text-foreground font-bold" numberOfLines={1}>{item.username}</Text>
                                                <Text className="text-primary text-[10px] font-bold uppercase">{item.referral_code || 'Miembro'}</Text>
                                            </View>
                                        </View>

                                        {isAlreadyMember ? (
                                            <View className="bg-success/20 px-3 py-1.5 rounded-xl border border-success/30">
                                                <Text className="text-success text-[10px] font-bold">MIEMBRO</Text>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => handleInvite(userId)}
                                                className="bg-primary px-4 py-2 rounded-xl"
                                                disabled={inviteMutation.isPending}
                                            >
                                                {inviteMutation.isPending ? (
                                                    <ActivityIndicator color="white" size="small" />
                                                ) : (
                                                    <Text className="text-white font-bold text-xs">Invitar</Text>
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            }}
                            ListEmptyComponent={() => (
                                <View className="items-center py-10 opacity-40">
                                    <Ionicons name="people-outline" size={48} color="white" />
                                    <Text className="text-white text-center mt-4 px-10">
                                        {searchQuery.length > 3 ? 'No se encontraron usuarios.' : 'Tus amigos aparecerán aquí para una invitación rápida.'}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}


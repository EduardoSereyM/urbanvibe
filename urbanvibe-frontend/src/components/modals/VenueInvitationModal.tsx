import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    ActivityIndicator,
    Dimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSocial } from '../../hooks/useSocial';

const { height } = Dimensions.get('window');

const PREDEFINED_MESSAGES = [
    "¡Te invito a pasar un momento agradable aquí!",
    "¿Vamos a probar este lugar? Se ve genial.",
    "¡Mira este local! Deberíamos ir pronto.",
    "He pensado que te gustaría venir aquí conmigo."
];

interface Props {
    isVisible: boolean;
    onClose: () => void;
    venueId: string;
    venueName: string;
}

export default function VenueInvitationModal({ isVisible, onClose, venueId, venueName }: Props) {
    const { useFriendsList, useSendVenueInvitation, useMyGroups } = useSocial();
    const { data: friends, isLoading: isLoadingFriends } = useFriendsList();
    const { data: myGroups, isLoading: isLoadingGroups } = useMyGroups();
    const sendInvitation = useSendVenueInvitation();

    const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('friends');
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const acceptedFriends = friends?.filter(f => f.status === 'accepted') || [];

    const handleSend = async () => {
        if (!selectedFriendId && !selectedGroupId) return;

        setIsSending(true);
        try {
            await sendInvitation.mutateAsync({
                friend_id: selectedFriendId,
                group_id: selectedGroupId,
                venue_id: venueId,
                message: message.trim() || PREDEFINED_MESSAGES[0]
            });
            onClose();
            setSelectedFriendId(null);
            setSelectedGroupId(null);
            setMessage('');
        } catch (error) {
            console.error("Error al enviar invitación:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/60">
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onClose}
                    className="absolute inset-0"
                />

                <View
                    className="bg-surface rounded-t-[40px] px-6 pb-12 pt-8"
                    style={{ maxHeight: height * 0.9 }}
                >
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-foreground font-brand text-2xl">Invitar</Text>
                            <Text className="text-foreground-muted text-xs mt-1">Comparte {venueName}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-surface-active p-2 rounded-full">
                            <Ionicons name="close" size={24} color="#FA4E35" />
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View className="flex-row bg-surface-active rounded-2xl p-1 mb-6">
                        <TouchableOpacity
                            onPress={() => { setActiveTab('friends'); setSelectedGroupId(null); }}
                            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${activeTab === 'friends' ? 'bg-surface shadow-sm' : ''}`}
                        >
                            <Ionicons name="person" size={16} color={activeTab === 'friends' ? '#FA4E35' : '#606270'} />
                            <Text className={`ml-2 font-bold text-xs ${activeTab === 'friends' ? 'text-foreground' : 'text-foreground-muted'}`}>Amigos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { setActiveTab('groups'); setSelectedFriendId(null); }}
                            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${activeTab === 'groups' ? 'bg-surface shadow-sm' : ''}`}
                        >
                            <Ionicons name="people" size={16} color={activeTab === 'groups' ? '#FA4E35' : '#606270'} />
                            <Text className={`ml-2 font-bold text-xs ${activeTab === 'groups' ? 'text-foreground' : 'text-foreground-muted'}`}>Grupos</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Selector Content */}
                        {activeTab === 'friends' ? (
                            <>
                                <Text className="text-foreground-muted font-bold text-[10px] uppercase tracking-widest mb-4">
                                    Selecciona un amigo
                                </Text>
                                {isLoadingFriends ? (
                                    <ActivityIndicator color="#FA4E35" className="my-10" />
                                ) : acceptedFriends.length > 0 ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                        {acceptedFriends.map((friend) => (
                                            <TouchableOpacity
                                                key={friend.friend_id}
                                                onPress={() => setSelectedFriendId(friend.friend_id)}
                                                className="mr-6 items-center"
                                            >
                                                <View className={`w-16 h-16 rounded-full border-2 p-1 ${selectedFriendId === friend.friend_id ? 'border-primary' : 'border-transparent'}`}>
                                                    <View className="w-full h-full rounded-full bg-surface-active overflow-hidden items-center justify-center">
                                                        {friend.avatar_url ? (
                                                            <Image source={{ uri: friend.avatar_url }} className="w-full h-full" />
                                                        ) : (
                                                            <Ionicons name="person" size={24} color="#FA4E35" />
                                                        )}
                                                    </View>
                                                </View>
                                                <Text
                                                    className={`text-[10px] mt-2 font-brand ${selectedFriendId === friend.friend_id ? 'text-primary' : 'text-foreground'}`}
                                                    numberOfLines={1}
                                                >
                                                    {friend.username}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <View className="py-8 items-center bg-surface-active rounded-2xl border border-dashed border-white/10">
                                        <Ionicons name="people-outline" size={32} color="#9CA3AF" />
                                        <Text className="text-foreground-muted text-xs mt-2">No tienes amigos agregados</Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <>
                                <Text className="text-foreground-muted font-bold text-[10px] uppercase tracking-widest mb-4">
                                    Selecciona un grupo
                                </Text>
                                {isLoadingGroups ? (
                                    <ActivityIndicator color="#FA4E35" className="my-10" />
                                ) : myGroups && myGroups.length > 0 ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                        {myGroups.map((group: any) => (
                                            <TouchableOpacity
                                                key={group.id}
                                                onPress={() => setSelectedGroupId(group.id)}
                                                className="mr-6 items-center"
                                            >
                                                <View className={`w-16 h-16 rounded-full border-2 p-1 ${selectedGroupId === group.id ? 'border-primary' : 'border-transparent'}`}>
                                                    <View className="w-full h-full rounded-full bg-surface-active overflow-hidden items-center justify-center">
                                                        {group.avatar_url ? (
                                                            <Image source={{ uri: group.avatar_url }} className="w-full h-full" />
                                                        ) : (
                                                            <Ionicons name="people" size={24} color="#FA4E35" />
                                                        )}
                                                    </View>
                                                </View>
                                                <Text
                                                    className={`text-[10px] mt-2 font-brand ${selectedGroupId === group.id ? 'text-primary' : 'text-foreground'}`}
                                                    numberOfLines={1}
                                                >
                                                    {group.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <View className="py-8 items-center bg-surface-active rounded-2xl border border-dashed border-white/10">
                                        <Ionicons name="people-circle-outline" size={32} color="#9CA3AF" />
                                        <Text className="text-foreground-muted text-xs mt-2">No perteneces a ningún grupo</Text>
                                    </View>
                                )}
                            </>
                        )}

                        {/* Message Selection */}
                        {(selectedFriendId || selectedGroupId) && (
                            <View className="mt-8">
                                <Text className="text-foreground-muted font-bold text-[10px] uppercase tracking-widest mb-4">
                                    Elige un mensaje
                                </Text>

                                <View className="flex-row flex-wrap">
                                    {PREDEFINED_MESSAGES.map((msg, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => setMessage(msg)}
                                            className={`px-4 py-2 rounded-full mr-2 mb-2 border ${message === msg ? 'bg-primary border-primary' : 'bg-surface-active border-white/5'}`}
                                        >
                                            <Text className={`text-[10px] ${message === msg ? 'text-white' : 'text-foreground-muted'}`}>
                                                {msg}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TextInput
                                    placeholder="O escribe un mensaje personalizado..."
                                    placeholderTextColor="#9CA3AF"
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                    className="bg-surface-active text-foreground font-body p-4 rounded-2xl mt-4 min-h-[80px]"
                                />

                                <TouchableOpacity
                                    onPress={handleSend}
                                    disabled={isSending}
                                    className="bg-primary py-4 rounded-2xl mt-8 flex-row items-center justify-center"
                                >
                                    {isSending ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Ionicons name="send" size={18} color="white" className="mr-2" />
                                            <Text className="text-white font-bold ml-2">Enviar a {activeTab === 'friends' ? 'amigo' : 'grupo'}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                                <Text className="text-primary/60 text-[10px] text-center mt-3 italic">
                                    * Ganarás 10 puntos al enviar esta invitación
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

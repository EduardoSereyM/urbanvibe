import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    FlatList,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSocial, UserSearchResponse } from '../../../src/hooks/useSocial';
import { useDebounce } from '../../../src/hooks/useDebounce';

export default function SearchFriendsScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 500);

    const { useSearchUsers, useSendFriendRequest } = useSocial();
    const { data: results, isLoading, isError } = useSearchUsers(debouncedQuery);
    const sendRequestMutation = useSendFriendRequest();

    const handleSendRequest = (user: UserSearchResponse) => {
        Alert.alert(
            'Enviar Invitación',
            `¿Deseas enviar una solicitud de amistad a ${user.username}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Enviar',
                    onPress: async () => {
                        try {
                            await sendRequestMutation.mutateAsync(user.id);
                            Alert.alert('¡Enviado!', 'Tu solicitud ha sido enviada correctamente.');
                        } catch (error: any) {
                            const msg = error.response?.data?.detail || 'No se pudo enviar la solicitud.';
                            Alert.alert('Error', msg);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: UserSearchResponse }) => (
        <View className="flex-row items-center justify-between bg-surface p-4 rounded-2xl mb-3 border border-surface-active">
            <View className="flex-row items-center flex-1">
                {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} className="w-12 h-12 rounded-full bg-surface-active" />
                ) : (
                    <View className="w-12 h-12 rounded-full bg-surface-active items-center justify-center">
                        <Ionicons name="person" size={24} color="#FA4E35" />
                    </View>
                )}
                <View className="ml-4 flex-1">
                    <Text className="text-foreground font-brand text-lg" numberOfLines={1}>{item.username}</Text>
                    <Text className="text-foreground-muted text-xs" numberOfLines={1}>{item.full_name || 'Miembro UrbanVibe'}</Text>
                    <View className="flex-row items-center mt-1">
                        <View className="bg-primary/20 px-2 py-0.5 rounded-full">
                            <Text className="text-primary text-[10px] font-bold uppercase">{item.current_level_name || 'Bronce'}</Text>
                        </View>
                        <Text className="text-foreground-muted text-[10px] ml-2">{item.referral_code}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                onPress={() => handleSendRequest(item)}
                className="bg-primary px-4 py-2 rounded-xl"
                disabled={sendRequestMutation.isPending}
            >
                <Text className="text-white font-bold text-xs">Invitar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background pt-10">
            <View className="px-6 pt-4 pb-2 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-surface-active mr-4">
                    <Ionicons name="arrow-back" size={24} color="#F2F1F0" />
                </TouchableOpacity>
                <Text className="font-brand text-2xl text-foreground">Buscar Amigos</Text>
            </View>

            <View className="px-6 mt-4">
                <View className="bg-surface flex-row items-center px-4 rounded-2xl border border-white/10 h-14">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        placeholder="Introduce email o código UV-XXXXXX"
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-3 text-foreground font-body"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 }}
                ListEmptyComponent={() => (
                    <View className="items-center mt-20 opacity-50">
                        {isLoading ? (
                            <ActivityIndicator color="#FA4E35" size="large" />
                        ) : searchQuery.length >= 3 ? (
                            <>
                                <Ionicons name="people-outline" size={64} color="#9CA3AF" />
                                <Text className="text-foreground-muted mt-4 font-body text-center">No encontramos resultados exactos. Revisa el código o email.</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="lock-closed-outline" size={64} color="#9CA3AF" />
                                <Text className="text-foreground-muted mt-4 font-body text-center px-10">Búsqueda privada. Debes ingresar el correo o código de referido exacto.</Text>
                            </>
                        )}
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

import React from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSocial } from '../../../../src/hooks/useSocial';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PublicProfileScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const { usePublicProfile, useUserGroups } = useSocial();
    const { data: profile, isLoading, isError } = usePublicProfile(id);
    const { data: userGroups, isLoading: isLoadingGroups } = useUserGroups(id);

    if (isLoading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator color="#FA4E35" size="large" />
            </View>
        );
    }

    if (isError || !profile) {
        return (
            <View className="flex-1 bg-background items-center justify-center px-10">
                <Ionicons name="alert-circle-outline" size={64} color="#FA4E35" />
                <Text className="text-foreground text-center mt-4 font-brand text-lg">No pudimos cargar este perfil.</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6 bg-surface-active px-6 py-3 rounded-xl"
                >
                    <Text className="text-foreground font-bold">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* HEADER / COVER IMAGE AREA */}
                <View className="h-64 w-full relative">
                    <LinearGradient
                        colors={['#FA4E35', '#232959']}
                        className="absolute inset-0"
                    />

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-12 left-6 w-10 h-10 items-center justify-center rounded-full bg-black/30"
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* AVATAR OVERLAP */}
                    <View className="absolute -bottom-16 left-1/2 -ml-20">
                        <View className="w-40 h-40 rounded-full border-4 border-background bg-surface-active overflow-hidden items-center justify-center">
                            {profile.avatar_url ? (
                                <Image source={{ uri: profile.avatar_url }} className="w-full h-full" />
                            ) : (
                                <Ionicons name="person" size={80} color="#FA4E35" />
                            )}
                        </View>
                    </View>
                </View>

                {/* PROFILE INFO */}
                <View className="mt-20 px-6 items-center">
                    <Text className="text-foreground font-brand text-3xl">{profile.username}</Text>
                    <Text className="text-foreground-muted font-body text-base mt-1">{profile.full_name || 'Miembro UrbanVibe'}</Text>

                    <View className="bg-primary/20 px-4 py-1.5 rounded-full mt-3 flex-row items-center">
                        <Ionicons name="flash" size={14} color="#FA4E35" className="mr-2" />
                        <Text className="text-primary font-bold text-xs uppercase tracking-widest">{profile.current_level_name || 'Bronce'}</Text>
                    </View>

                    {profile.bio && (
                        <Text className="text-foreground-muted text-center font-body mt-4 leading-relaxed">
                            {profile.bio}
                        </Text>
                    )}

                    {/* STATS */}
                    <View className="flex-row justify-around w-full mt-8 py-6 bg-surface rounded-3xl border border-surface-active">
                        <View className="items-center flex-1 border-r border-white/5">
                            <Text className="text-foreground font-brand text-2xl">{profile.verified_checkins_count}</Text>
                            <Text className="text-foreground-muted text-[10px] uppercase">Visitas</Text>
                        </View>
                        <View className="items-center flex-1 border-r border-white/5">
                            <Text className="text-foreground font-brand text-2xl">{profile.badges.length}</Text>
                            <Text className="text-foreground-muted text-[10px] uppercase">Insignias</Text>
                        </View>
                        <View className="items-center flex-1">
                            <Text className="text-foreground font-brand text-2xl" numberOfLines={1}>
                                {profile.reviews_count || 0}
                            </Text>
                            <Text className="text-foreground-muted text-[10px] uppercase">Reseñas</Text>
                        </View>
                    </View>

                    {/* BADGES SECTION */}
                    <View className="w-full mt-10">
                        <Text className="font-brand text-xl text-foreground mb-6">Insignias Obtenidas</Text>

                        {profile.badges.length > 0 ? (
                            <View className="flex-row flex-wrap justify-between">
                                {profile.badges.map((badge) => (
                                    <View key={badge.id} className="items-center mb-6" style={{ width: (width - 48) / 3 }}>
                                        <View className="w-20 h-20 rounded-2xl bg-surface items-center justify-center border border-white/5 mb-2 overflow-hidden">
                                            {badge.icon_url ? (
                                                <Image source={{ uri: badge.icon_url }} className="w-16 h-16" />
                                            ) : (
                                                <Ionicons name="ribbon" size={40} color="#FA4E35" />
                                            )}
                                        </View>
                                        <Text className="text-foreground text-[10px] font-brand text-center px-2" numberOfLines={1}>{badge.name}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className="items-center py-10 opacity-30 bg-surface rounded-3xl border border-surface-active border-dashed">
                                <Ionicons name="medal-outline" size={48} color="#9CA3AF" />
                                <Text className="text-foreground-muted mt-4 font-body">Aún no tiene insignias públicas.</Text>
                            </View>
                        )}
                    </View>

                    {/* GROUPS SECTION (V14) */}
                    <View className="w-full mt-10">
                        <Text className="font-brand text-xl text-foreground mb-6">Comunidades</Text>

                        {isLoadingGroups ? (
                            <ActivityIndicator color="#FA4E35" />
                        ) : (userGroups && userGroups.length > 0) ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                {userGroups.map((group: any) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        onPress={() => router.push(`/(user)/community/groups/${group.id}`)}
                                        className="bg-surface p-4 rounded-3xl border border-white/5 mr-4 items-center"
                                        style={{ width: 140 }}
                                    >
                                        <View className="w-16 h-16 rounded-2xl bg-surface-active items-center justify-center mb-3">
                                            {group.avatar_url ? (
                                                <Image source={{ uri: group.avatar_url }} className="w-full h-full rounded-2xl" />
                                            ) : (
                                                <Ionicons name="people" size={28} color="#FA4E35" />
                                            )}
                                        </View>
                                        <Text className="text-foreground font-brand text-center text-xs" numberOfLines={1}>{group.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        ) : (
                            <View className="p-8 bg-surface rounded-3xl border border-white/5 items-center opacity-40">
                                <Ionicons name="people-outline" size={32} color="white" />
                                <Text className="text-white text-[10px] uppercase font-bold mt-2">No pertenece a grupos públicos</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}

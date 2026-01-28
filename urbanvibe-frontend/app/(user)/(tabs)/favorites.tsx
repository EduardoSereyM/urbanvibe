import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHydratedFavorites } from '../../../src/hooks/useFavorites';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
    const router = useRouter();
    const { data: venues, isLoading, refetch } = useHydratedFavorites();

    if (isLoading && !venues) {
        return (
            <View className="flex-1 bg-[#0F172A] items-center justify-center">
                <ActivityIndicator size="large" color="#00E5FF" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#0F172A]">
            {/* Background Decorations */}
            <View className="absolute top-[-100] right-[-50] w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />
            <View className="absolute bottom-[-50] left-[-50] w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full" />

            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-6 pt-6 pb-2">
                    <Text className="text-white font-brand-bold text-4xl tracking-tight">Favoritos</Text>
                    <Text className="text-gray-400 font-body text-sm mt-1">Tus lugares guardados</Text>
                </View>

                <FlatList
                    data={venues}
                    keyExtractor={(item) => item?.id as string}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-32 space-y-6">
                            <View className="w-24 h-24 bg-white/5 rounded-full items-center justify-center border border-white/10 shadow-2xl">
                                <Ionicons name="heart-dislike-outline" size={48} color="#94A3B8" />
                            </View>
                            <View className="items-center px-12">
                                <Text className="text-white font-brand text-xl text-center">¡Ups! Está vacío</Text>
                                <Text className="text-gray-400 font-body text-center mt-2">
                                    Parece que aún no tienes favoritos. Sal a explorar la ciudad y guarda tus rincones preferidos.
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/explore')}
                                className="bg-primary/20 border border-primary/30 px-8 py-3 rounded-2xl"
                            >
                                <Text className="text-primary font-bold">Ir a Explorar</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => router.push(`/venue/${item?.id}`)}
                            className="mb-5"
                        >
                            <LinearGradient
                                colors={['#1E293B', '#111827']}
                                className="rounded-[28px] overflow-hidden border border-white/10 shadow-2xl"
                            >
                                <View className="flex-row p-3 gap-4">
                                    {/* Image Section */}
                                    <View className="relative">
                                        <Image
                                            source={item?.logo_url ? { uri: item.logo_url } : { uri: item?.cover_image_urls?.[0] }}
                                            className="w-24 h-24 rounded-2xl bg-slate-800"
                                            resizeMode="cover"
                                        />
                                        <View className="absolute top-[-5] right-[-5] bg-red-500 w-8 h-8 rounded-full items-center justify-center border-2 border-[#1E293B]">
                                            <Ionicons name="heart" size={16} color="white" />
                                        </View>
                                    </View>

                                    {/* Content Section */}
                                    <View className="flex-1 justify-center py-1">
                                        <View className="flex-row items-center justify-between mb-1">
                                            <Text className="text-white font-brand-bold text-xl flex-1 mr-2" numberOfLines={1}>
                                                {item?.name}
                                            </Text>
                                        </View>

                                        <View className="flex-row items-center">
                                            <Text className="text-cyan-400 font-body-semibold text-xs uppercase tracking-widest">
                                                {item?.category_name || 'LOCAL'}
                                            </Text>
                                        </View>

                                        <View className="flex-row items-center mt-3 gap-3">
                                            <View className="flex-row items-center bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                                                <Ionicons name="star" size={12} color="#FBBF24" />
                                                <Text className="text-white text-xs ml-1 font-bold">
                                                    {item?.rating_average?.toFixed(1) || '0.0'}
                                                </Text>
                                            </View>

                                            {item?.price_tier && (
                                                <View className="bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                                    <Text className="text-emerald-400 text-[10px] font-bold">
                                                        {'$'.repeat(item.price_tier)}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Chevron */}
                                    <View className="justify-center px-1">
                                        <View className="bg-white/5 w-8 h-8 rounded-full items-center justify-center">
                                            <Ionicons name="chevron-forward" size={18} color="#64748B" />
                                        </View>
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        </View>
    );
}

import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHydratedFavorites } from '../../../src/hooks/useFavorites';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
    const router = useRouter();
    const { data: venues, isLoading, refetch } = useHydratedFavorites();

    if (isLoading && (!venues || venues.length === 0)) {
        return <View className="flex-1 bg-background items-center justify-center"><ActivityIndicator size="large" color="#00E0FF" /></View>;
    }



    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="px-5 pt-4 mb-2">
                <Text className="text-foreground font-brand text-2xl">Mis Favoritos</Text>
            </View>

            <FlatList
                data={venues}
                keyExtractor={(item) => item?.id as string}
                contentContainerStyle={{ padding: 20, gap: 16 }}
                onRefresh={refetch}
                refreshing={isLoading}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20 opacity-50">
                        <Ionicons name="heart-circle-outline" size={80} color="#606270" />
                        <Text className="text-foreground-muted font-body mt-4 text-center px-10">
                            Aún no tienes locales favoritos. ¡Explora y guarda los que más te gusten!
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => router.push(`/venue/${item?.id}`)} // Fixed path, was /venue/
                        className="bg-surface rounded-2xl overflow-hidden border border-surface-active p-3 flex-row gap-4 mb-1"
                    >
                        <Image
                            source={item?.logo_url ? { uri: item.logo_url } : { uri: item?.cover_image_urls?.[0] }}
                            className="w-20 h-20 rounded-xl bg-surface-deep/50"
                            resizeMode="cover"
                        />
                        {/* Fallback icon if no image */}
                        {(!item?.logo_url && (!item?.cover_image_urls || item.cover_image_urls.length === 0)) && (
                            <View className="absolute left-3 top-3 w-20 h-20 rounded-xl bg-surface-deep items-center justify-center">
                                <Ionicons name="storefront-outline" size={24} color="#666" />
                            </View>
                        )}

                        <View className="flex-1 justify-center">
                            <Text className="text-foreground font-brand text-lg" numberOfLines={1}>{item?.name}</Text>
                            <Text className="text-foreground-muted text-sm">{item?.category_name || 'Venue'}</Text>
                            <View className="flex-row items-center mt-2 gap-3">
                                <View className="flex-row items-center bg-surface-deep px-1.5 py-0.5 rounded border border-white/5">
                                    <Ionicons name="star" size={10} color="#F59E0B" />
                                    <Text className="text-foreground-muted text-xs ml-1 font-bold">{item?.rating_average?.toFixed(1) || '0.0'}</Text>
                                </View>
                                {item?.price_tier && (
                                    <Text className="text-foreground-muted text-xs">{'$'.repeat(item.price_tier)}</Text>
                                )}
                            </View>
                        </View>
                        <View className="justify-center mr-2">
                            <Ionicons name="chevron-forward" size={16} color="#454A66" />
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

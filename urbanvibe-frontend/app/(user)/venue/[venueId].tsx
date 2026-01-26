import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
// import ImageViewing from "react-native-image-viewing"; // Removed due to error
import React, { useState, useRef } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    Animated,
    Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// Removed: useVenue, useVenuePromotionsUser, useMyFavorites
import { useVenueDetails } from '../../../src/hooks/useVenueDetails';
import { useClaimPromotion } from '../../../src/hooks/usePromotions';
import { useToggleFavoriteVenue } from '../../../src/hooks/useFavorites';
import { client } from '../../../src/api/client';
import { Alert, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import type { UserPromotionBFFItem } from '../../../src/types';
import QRScannerModal from '../../../src/components/QRScannerModal';
import VenueInvitationModal from '../../../src/components/modals/VenueInvitationModal';
import ImageViewerModal from '../../../src/components/modals/ImageViewerModal';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 200;

export default function VenueDetailScreen() {
    const { venueId } = useLocalSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    // BFF Hook: Fetches Venue + Favorites + Promotions in one go
    const { data: bffData, isLoading, error, refetch } = useVenueDetails(venueId as string);

    // Derived State
    const venue = bffData?.venue;
    const isFavorite = bffData?.is_favorite;
    const activePromotions = bffData?.active_promotions || [];

    // Mutations
    const { mutate: toggleFavorite } = useToggleFavoriteVenue();

    // State
    const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'reviews' | 'rewards'>('overview');
    const [activeIndex, setActiveIndex] = useState(0); // For carousel
    const scrollY = useRef(new Animated.Value(0)).current;

    // Reviews State
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    // Fixed: Restore scannerVisible
    const [scannerVisible, setScannerVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showInvitationModal, setShowInvitationModal] = useState(false);

    // Image Viewer
    const [viewerVisible, setViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleCheckinSuccess = () => {
        setSuccessMessage("¡Check-in exitoso! Has ganado puntos.");
        setTimeout(() => setSuccessMessage(null), 5000);
        // Refresh venue details to show new check-in status if applicable
        queryClient.invalidateQueries({ queryKey: ['venue-details', venueId] });
    };

    // Fetch Reviews on Tab Change
    React.useEffect(() => {
        if (activeTab === 'reviews' && venueId) {
            fetchReviews();
        }
    }, [activeTab, venueId]);

    const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
            const res = await client.get(`/reviews/venue/${venueId}`);
            setReviews(res.data);
        } catch (e) {
            console.log('Error fetching reviews', e);
        } finally {
            setLoadingReviews(false);
        }
    };

    const submitReview = async () => {
        if (!comment.trim()) {
            Alert.alert('Error', 'Por favor escribe un comentario.');
            return;
        }
        setSubmitting(true);
        try {
            await client.post('/reviews/', {
                venue_id: venueId,
                general_score: rating,
                comment: comment
            });
            Alert.alert('¡Gracias!', 'Tu reseña ha sido publicada.');
            setShowReviewModal(false);
            setComment('');
            setRating(5);
            fetchReviews(); // Refresh list

            // Refetch BFF to update aggregate ratings if backend recalculated them immediately
            queryClient.invalidateQueries({ queryKey: ['venue-details', venueId] });
            refetch();
        } catch (e: any) {
            console.log('Review error:', e);
            Alert.alert('Error', 'No se pudo publicar la reseña. Inténtalo de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        if (router.canGoBack()) router.back();
        else router.replace('/(user)/(tabs)/explore');
    };

    const handleShare = async () => {
        if (!venue) return;
        try {
            await Share.share({
                message: `¡Mira este lugar en UrbanVibe! ${venue.name}`,
                url: `https://urbanvibe.app/venue/${venue.id}`, // Fake deep link
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleCall = () => {
        if (venue?.contact_phone) {
            Linking.openURL(`tel:${venue.contact_phone}`);
        }
    };

    const openMap = () => {
        if (!venue?.location) return;
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${venue.location.lat},${venue.location.lng}`;
        const label = venue.name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        if (url) Linking.openURL(url);
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#FA4E35" />
            </View>
        );
    }

    if (error || !venue) {
        return (
            <View className="flex-1 bg-background items-center justify-center p-6">
                <Text className="text-destructive font-brand text-xl mb-4 text-center">Error al cargar el local</Text>
                <TouchableOpacity onPress={handleBack} className="bg-surface-active px-6 py-3 rounded-full">
                    <Text className="text-foreground font-brand">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Carousel Data
    const images = venue.cover_image_urls?.length
        ? venue.cover_image_urls
        : ['https://via.placeholder.com/800x600/1B1D37/FFFFFF?text=UrbanVibe'];

    const renderCarouselItem = ({ item }: { item: string }) => (
        <View style={{ width, height: HEADER_HEIGHT }}>
            <Image
                source={{ uri: item }}
                style={{ width, height: HEADER_HEIGHT }}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['rgba(27,29,55,0)', 'rgba(27,29,55,0.6)', '#1B1D37']}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }}
            />
        </View>
    );

    const onScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setActiveIndex(Math.round(index));
    };

    return (
        <View className="flex-1 bg-background">
            <StatusBar barStyle="light-content" />

            {/* HEADER - Absolute */}
            <View className="absolute top-12 left-4 right-4 flex-row justify-between z-50">
                <TouchableOpacity
                    onPress={handleBack}
                    className="w-10 h-10 rounded-full bg-black/30 items-center justify-center backdrop-blur-md"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={() => setShowInvitationModal(true)}
                        className="w-10 h-10 rounded-full bg-black/30 items-center justify-center backdrop-blur-md"
                    >
                        <Ionicons name="people-outline" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setShowReviewModal(true)}
                        className="w-10 h-10 rounded-full bg-black/30 items-center justify-center backdrop-blur-md"
                    >
                        <Ionicons name="star-outline" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            if (!venue) return;
                            toggleFavorite({ venueId: venue.id, isFavorite: !!isFavorite }, {
                                onSuccess: () => {
                                    // Invalidate BFF to refresh favorites status if needed, 
                                    // though optimistic update handles it visually usually.
                                    queryClient.invalidateQueries({ queryKey: ['venue-details', venueId] });
                                }
                            });
                        }}
                        className="w-10 h-10 rounded-full bg-black/30 items-center justify-center backdrop-blur-md"
                    >
                        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#EF4444" : "white"} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[2]} // Sticky Tabs
                scrollEventThrottle={16}
            >
                {/* 1. GALLERY CAROUSEL */}
                <View style={{ height: HEADER_HEIGHT }}>
                    <FlatList
                        data={images}
                        renderItem={renderCarouselItem}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={onScroll}
                        keyExtractor={(_, index) => index.toString()}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }}
                    />

                    <View className="absolute -bottom-12 left-5 z-20 shadow-lg">
                        {venue.logo_url ? (
                            <Image
                                source={{ uri: venue.logo_url }}
                                className="w-24 h-24 rounded-2xl border-4 border-background bg-surface-active"
                            />
                        ) : (
                            <View className="w-24 h-24 rounded-2xl border-4 border-background bg-surface-active items-center justify-center">
                                <Ionicons name="storefront-outline" size={40} color="#606270" />
                            </View>
                        )}
                    </View>

                    {images.length > 1 && (
                        <View className="absolute bottom-16 right-5 flex-row gap-1.5">
                            {images.map((_, i) => (
                                <View
                                    key={i}
                                    className={`h-1.5 rounded-full ${i === activeIndex ? 'w-4 bg-primary' : 'w-1.5 bg-white/50'}`}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* 2. TITLE & ACTION BAR */}
                <View className="px-5 pb-6 mt-12 bg-background rounded-t-3xl border-t border-white/5 pt-4">
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                            {venue.is_testing && (
                                <View className="bg-red-500 self-start px-3 py-1 rounded-full mb-2 border border-white/10">
                                    <Text className="text-white text-[10px] font-bold">LOCAL DE PRUEBA</Text>
                                </View>
                            )}
                            <Text className="text-foreground font-brand text-2xl leading-tight">
                                {venue.name}
                            </Text>
                            {venue.slogan && (
                                <Text className="text-foreground-muted font-body text-sm mt-1">
                                    {venue.slogan}
                                </Text>
                            )}
                            {venue.overview && (
                                <View className="mt-4">
                                    <Text className="text-foreground-muted font-bold text-[10px] uppercase tracking-widest mb-1">Descripción</Text>
                                    <Text className="text-foreground font-body leading-relaxed text-base opacity-90">
                                        {venue.overview}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {/* Rating Badge */}
                        <View className="items-end gap-1.5">
                            <View className="flex-row items-center bg-surface px-2 py-1 rounded-lg border border-surface-active">
                                <Ionicons name="star" size={14} color="#F59E0B" />
                                <Text className="text-foreground font-bold ml-1">{venue.rating_average?.toFixed(1) || '0.0'}</Text>
                            </View>
                            <View className="flex-row items-center bg-surface px-2 py-1 rounded-lg border border-surface-active">
                                <Ionicons name="heart" size={14} color="#EF4444" />
                                <Text className="text-foreground font-bold ml-1">{venue.favorites_count || 0}</Text>
                            </View>
                            <View className="flex-row items-center bg-surface px-2 py-1 rounded-lg border border-surface-active">
                                <Ionicons name="chatbubble-ellipses" size={14} color="#3B82F6" />
                                <Text className="text-foreground font-bold ml-1">{venue.review_count || 0}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row gap-8 mb-6 mt-2">
                        <View>
                            <Text className="text-foreground-muted font-bold text-[10px] uppercase tracking-widest mb-1">Categoría</Text>
                            <View className="bg-surface-active px-3 py-1.5 rounded-xl border border-white/5 self-start">
                                <Text className="text-foreground font-body text-sm">
                                    {venue.category_name || venue.category_id || 'General'}
                                </Text>
                            </View>
                        </View>
                        <View>
                            <Text className="text-foreground-muted font-bold text-[10px] uppercase tracking-widest mb-1">Nivel de Precio</Text>
                            <View className="bg-surface-active px-3 py-1.5 rounded-xl border border-white/5 self-start">
                                <Text className="text-primary font-bold text-sm">
                                    {'$'.repeat(venue.price_tier || 1)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* ACTION BAR */}

                    {/* ACTION BAR */}

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 12 }}>
                        <ActionButton
                            icon="qr-code-outline"
                            label="Check-in"
                            onPress={() => setScannerVisible(true)}
                            variant="primary"
                        />
                        <ActionButton
                            icon="navigate"
                            label="Ir"
                            onPress={openMap}
                        />
                        <ActionButton
                            icon="share-outline"
                            label="Compartir"
                            onPress={() => { }}
                            disabled={true}
                        // TODO: Implement share functionality properly (Deep linking / Social Share)
                        />
                        <ActionButton
                            icon="call"
                            label="Llamar"
                            onPress={handleCall}
                            disabled={!venue.contact_phone}
                        />
                        <ActionButton
                            icon="logo-whatsapp"
                            label="Chat"
                            onPress={() => { }} // Placeholder
                        />
                        <ActionButton
                            icon="globe-outline"
                            label="Web"
                            onPress={() => venue.website && Linking.openURL(venue.website)}
                            disabled={!venue.website}
                        />
                    </ScrollView>
                </View>

                {/* 3. TABS (Sticky) */}
                <View className="bg-background pt-2 pb-2 pl-5 border-b border-white/5 mb-4 z-40">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-4 pr-5">
                        <TabButton
                            label="Resumen"
                            active={activeTab === 'overview'}
                            onPress={() => setActiveTab('overview')}
                        />
                        <TabButton
                            label="Menú"
                            active={activeTab === 'menu'}
                            onPress={() => setActiveTab('menu')}
                        />
                        <TabButton
                            label="Reseñas"
                            active={activeTab === 'reviews'}
                            onPress={() => setActiveTab('reviews')}
                        />
                        <TabButton
                            label="Recompensas"
                            active={activeTab === 'rewards'}
                            onPress={() => setActiveTab('rewards')}
                        />
                    </ScrollView>
                </View>

                {/* 4. CONTENT */}
                <View className="px-5 pb-32 min-h-[400px]">
                    {activeTab === 'overview' && (
                        <View className="space-y-6">
                            {/* Location Row */}
                            <TouchableOpacity onPress={openMap} className="flex-row items-center py-3">
                                <View className="w-10 h-10 rounded-full bg-surface items-center justify-center mr-3">
                                    <Ionicons name="location-outline" size={20} color="#00E0FF" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-body-bold">Ubicación</Text>
                                    <Text className="text-foreground-muted text-sm" numberOfLines={1}>{venue.address_display || 'Ver en mapa'}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#606270" />
                            </TouchableOpacity>

                            {/* Hours Row */}
                            <TouchableOpacity className="flex-row items-center py-3 border-t border-white/10">
                                <View className="w-10 h-10 rounded-full bg-surface items-center justify-center mr-3">
                                    <Ionicons name="time-outline" size={20} color="#FA4E35" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-body-bold">Horarios</Text>
                                    <Text className="text-success text-sm">
                                        {(() => {
                                            if (!venue.opening_hours?.regular) return 'Horario no disponible';

                                            const now = new Date();
                                            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                            const dayName = days[now.getDay()];
                                            const schedule = venue.opening_hours.regular.find((d: any) => d.day === dayName);

                                            if (!schedule || schedule.closed) return 'Cerrado hoy';

                                            try {
                                                const [openH, openM] = schedule.open.split(':').map(Number);
                                                const [closeH, closeM] = schedule.close.split(':').map(Number);
                                                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                                                const openMinutes = openH * 60 + openM;
                                                let closeMinutes = closeH * 60 + closeM;

                                                if (closeMinutes < openMinutes) {
                                                    closeMinutes += 24 * 60;
                                                }

                                                if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
                                                    return `Abierto · Cierra a las ${schedule.close}`;
                                                } else if (currentMinutes < openMinutes) {
                                                    return `Cerrado · Abre a las ${schedule.open}`;
                                                } else {
                                                    return 'Cerrado por hoy';
                                                }
                                            } catch (e) {
                                                return `Horario: ${schedule.open} - ${schedule.close}`;
                                            }
                                        })()}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-down" size={16} color="#606270" />
                            </TouchableOpacity>

                            {/* Tags / Vibe */}
                            {venue.mood_tags && venue.mood_tags.length > 0 && (
                                <View className="pt-2">
                                    <Text className="text-foreground font-body-bold mb-3">Ambiente</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {venue.mood_tags.map((tag: string, idx: number) => (
                                            <View key={idx} className="bg-surface px-3 py-1.5 rounded-full border border-surface-active">
                                                <Text className="text-foreground-muted text-xs capitalize">
                                                    {tag.replace(/_/g, ' ')}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    {activeTab === 'menu' && (
                        <View className="py-6">
                            <Text className="text-foreground font-brand text-xl mb-4">Menú del Local</Text>

                            {venue.menu_media_urls && venue.menu_media_urls.length > 0 ? (
                                <View className="flex-row flex-wrap gap-3">
                                    {venue.menu_media_urls.map((item: any, index: number) => {
                                        // Prioritize showing images. If typing is ambiguous, assume image if url presents.
                                        // You might want to filter by item.type === 'image' if strict.
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => {
                                                    setCurrentImageIndex(index);
                                                    setViewerVisible(true);
                                                }}
                                                className="w-[48%] aspect-[3/4] rounded-xl bg-surface border border-surface-active overflow-hidden relative"
                                            >
                                                <Image
                                                    source={{ uri: item.url }}
                                                    className="w-full h-full"
                                                    resizeMode="cover"
                                                />
                                                <View className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                                                    <Text className="text-white text-xs font-bold" numberOfLines={1}>
                                                        {item.name || `Página ${index + 1}`}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ) : (
                                <View className="items-center justify-center py-10">
                                    <View className="w-16 h-16 bg-surface rounded-full items-center justify-center mb-4">
                                        <Ionicons name="images-outline" size={32} color="#606270" />
                                    </View>
                                    <Text className="text-foreground font-brand text-lg">Sin Imágenes</Text>
                                    <Text className="text-foreground-muted text-center mt-2 px-8">
                                        Este local no ha subido fotos de su menú.
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {activeTab === 'reviews' && (
                        <View className="py-6">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-foreground font-brand text-xl">Comunidad</Text>
                                <TouchableOpacity
                                    onPress={() => setShowReviewModal(true)}
                                    className="bg-surface-active px-4 py-2 rounded-full"
                                >
                                    <Text className="text-foreground font-body-bold text-sm">Escribir Reseña</Text>
                                </TouchableOpacity>
                            </View>

                            {loadingReviews ? (
                                <ActivityIndicator color="#FA4E35" />
                            ) : reviews.length === 0 ? (
                                <View className="items-center py-10 opacity-50">
                                    <Ionicons name="chatbubble-outline" size={40} color="white" />
                                    <Text className="text-white mt-4 font-body">Sé el primero en opinar</Text>
                                </View>
                            ) : (
                                <View className="space-y-4">
                                    {reviews.map((review) => (
                                        <View key={review.id} className="bg-surface p-4 rounded-xl border border-white/5">
                                            <View className="flex-row justify-between items-start mb-2">
                                                <View className="flex-row items-center gap-2">
                                                    <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
                                                        <Text className="text-primary font-bold">{review.user_display_name?.[0] || 'U'}</Text>
                                                    </View>
                                                    <View>
                                                        <Text className="text-foreground font-bold text-sm">{review.user_display_name || 'Usuario'}</Text>
                                                        <Text className="text-foreground-muted text-xs">{new Date(review.created_at).toLocaleDateString()}</Text>
                                                    </View>
                                                </View>
                                                <View className="flex-row items-center bg-black/30 px-2 py-1 rounded-lg">
                                                    <Ionicons name="star" size={12} color="#F59E0B" />
                                                    <Text className="text-white text-xs font-bold ml-1">{review.general_score}</Text>
                                                </View>
                                            </View>
                                            <Text className="text-foreground-muted font-body text-sm leading-relaxed">
                                                {review.comment}
                                            </Text>
                                            {/* Owner Reply */}
                                            {review.owner_response && (
                                                <View className="mt-3 ml-4 pl-3 border-l-2 border-primary">
                                                    <Text className="text-primary text-xs font-bold mb-1">Respuesta del Local</Text>
                                                    <Text className="text-foreground-muted text-xs italic">
                                                        "{review.owner_response}"
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {activeTab === 'rewards' && (
                        <View className="py-6">
                            <RewardsSection promotions={activePromotions} />
                        </View>
                    )}
                </View>
            </ScrollView>

            <BottomNavBar router={router} currentRoute="venue" />

            <Modal
                visible={showReviewModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowReviewModal(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end">
                    <View className="bg-background border-t border-white/10 rounded-t-3xl p-6 h-[500px]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white font-brand text-xl">Tu Opinión</Text>
                            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View className="items-center mb-8">
                            <Text className="text-foreground-muted mb-4">¿Qué tal estuvo tu experiencia?</Text>
                            <View className="flex-row gap-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                        <Ionicons
                                            name={star <= rating ? "star" : "star-outline"}
                                            size={32}
                                            color={star <= rating ? "#F59E0B" : "#606270"}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TextInput
                            className="bg-surface text-white p-4 rounded-xl min-h-[120px] mb-6 text-base"
                            placeholder="Comparte los detalles... (comida, servicio, ambiente)"
                            placeholderTextColor="#606270"
                            multiline
                            textAlignVertical="top"
                            value={comment}
                            onChangeText={setComment}
                        />

                        <TouchableOpacity
                            className={`bg-primary py-4 rounded-xl items-center ${submitting ? 'opacity-50' : ''}`}
                            onPress={submitReview}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Publicar Reseña</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <QRScannerModal
                visible={scannerVisible}
                onClose={() => setScannerVisible(false)}
                onCheckinSuccess={handleCheckinSuccess}
            />

            {/* Success Banner Overlay */}
            {successMessage && (
                <View className="absolute top-24 left-4 right-4 bg-success p-4 rounded-xl shadow-lg z-50 flex-row items-center animate-bounce">
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                    <Text className="text-white font-bold ml-3 flex-1">{successMessage}</Text>
                </View>
            )}

            <VenueInvitationModal
                isVisible={showInvitationModal}
                onClose={() => setShowInvitationModal(false)}
                venueId={venueId as string}
                venueName={venue.name}
            />

            {/* <ImageViewing
                images={(venue.menu_media_urls || []).map((item: any) => ({ uri: item.url }))}
                imageIndex={currentImageIndex}
                visible={viewerVisible}
                onRequestClose={() => setViewerVisible(false)}
            /> */}

            <ImageViewerModal
                images={(venue.menu_media_urls || []).map((item: any) => ({ uri: item.url, name: item.name }))}
                initialIndex={currentImageIndex}
                visible={viewerVisible}
                onClose={() => setViewerVisible(false)}
            />
        </View>
    );
}

// Sub-components
function ActionButton({ icon, label, onPress, disabled, variant = 'surface' }: { icon: any, label: string, onPress: () => void, disabled?: boolean, variant?: 'primary' | 'surface' }) {
    const isPrimary = variant === 'primary';
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className={`w-24 items-center justify-center py-3 rounded-2xl ${isPrimary ? 'bg-primary' : 'bg-surface border border-surface-active'} ${disabled ? 'opacity-50' : ''}`}
        >
            <Ionicons name={icon} size={22} color={isPrimary ? 'white' : '#94A3B8'} />
            <Text numberOfLines={1} className={`text-xs mt-1 font-body-bold ${isPrimary ? 'text-white' : 'text-foreground-muted'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function TabButton({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} className="mr-2">
            <View className={`px-4 py-2 rounded-full border ${active ? 'bg-white border-white' : 'bg-transparent border-surface-active'}`}>
                <Text className={`font-brand text-sm ${active ? 'text-black' : 'text-foreground-muted'}`}>
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

// Updated component to use pre-fetched BFF data
function RewardsSection({ promotions }: { promotions: UserPromotionBFFItem[] }) {
    const claimMutation = useClaimPromotion();
    const queryClient = require('@tanstack/react-query').useQueryClient();

    if (!promotions || promotions.length === 0) return null;

    const handleClaim = (promo: UserPromotionBFFItem) => {
        // SERVER-SIDE VALIDATION: Trust the backend BFF value
        if (!promo.can_redeem) {
            Alert.alert("No disponible", promo.redeem_alert || "No cumples los requisitos para canjear esta recompensa.");
            return;
        }

        Alert.alert(
            "Canjear Recompensa",
            `¿Quieres gastar ${promo.points_cost} puntos por '${promo.title}'?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Canjear",
                    onPress: () => {
                        claimMutation.mutate(promo.id, {
                            onSuccess: (data: any) => {
                                Alert.alert("¡Canjeado!", data.message);
                                // Refresh user points and global context
                                queryClient.invalidateQueries({ queryKey: ['profile-context'] });
                            },
                            onError: (err: any) => {
                                Alert.alert("Error", err.response?.data?.detail || "No se pudo canjear.");
                            }
                        });
                    }
                }
            ]
        );
    };

    return (
        <View className="mb-6">
            <Text className="text-foreground font-brand text-xl mb-3">Recompensas y Promos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-0">
                {promotions.map((promo) => (
                    <View key={promo.id} className={`mr-4 p-4 rounded-xl border ${promo.promo_type === 'uv_reward' ? 'bg-surface border-orange-500/50' : 'bg-surface border-white/10'} w-64`}>
                        <View className="flex-row justify-between items-start mb-2">
                            {promo.promo_type === 'uv_reward' ? (
                                <View className="bg-orange-500/20 px-2 py-1 rounded-lg">
                                    <Text className="text-orange-500 font-bold text-xs">💎 {promo.points_cost} Pts</Text>
                                </View>
                            ) : (
                                <View className="bg-blue-500/20 px-2 py-1 rounded-lg">
                                    <Text className="text-blue-400 font-bold text-xs">Promo</Text>
                                </View>
                            )}
                        </View>

                        <Text className="text-white font-bold text-lg mb-4">{promo.title}</Text>

                        {promo.promo_type === 'uv_reward' ? (
                            <TouchableOpacity
                                onPress={() => handleClaim(promo)}
                                className={`py-2 rounded-lg items-center ${promo.can_redeem
                                    ? 'bg-orange-500'
                                    : 'bg-surface-active'
                                    }`}
                                disabled={!promo.can_redeem}
                            >
                                <Text className={`font-bold ${promo.can_redeem
                                    ? 'text-white'
                                    : 'text-foreground-muted'
                                    }`}>
                                    {promo.can_redeem ? "Canjear" : (promo.redeem_alert || "Faltan Puntos")}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="bg-surface-active py-2 rounded-lg items-center">
                                <Text className="text-foreground-muted font-bold">Ver Detalles</Text>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

function BottomNavBar({ router, currentRoute }: { router: any, currentRoute: string }) {
    const navigateToTab = (route: string) => {
        router.push(`/(user)/(tabs)/${route}`);
    };

    return (
        <View
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#1B1D37',
                borderTopColor: '#252A4A',
                borderTopWidth: 1,
                height: Platform.OS === 'android' ? 60 : 80,
                paddingTop: 8,
                paddingBottom: Platform.OS === 'ios' ? 20 : 8,
                zIndex: 100, // Ensure it's on top
            }}
        >
            <View className="flex-row justify-around items-center flex-1">
                <TouchableOpacity
                    onPress={() => navigateToTab('explore')}
                    className="items-center justify-center flex-1"
                >
                    <Ionicons
                        name={currentRoute === 'explore' ? 'map' : 'map-outline'}
                        size={28}
                        color={currentRoute === 'explore' ? '#FA4E35' : '#fa4f3585'}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigateToTab('venues')} // Updated
                    className="items-center justify-center flex-1"
                >
                    <Ionicons
                        name={currentRoute === 'venues' ? 'list' : 'list-outline'}
                        size={28}
                        color={currentRoute === 'venues' ? '#FA4E35' : '#fa4f3585'}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigateToTab('favorites')}
                    className="items-center justify-center flex-1"
                >
                    <Ionicons
                        name={currentRoute === 'favorites' ? 'heart' : 'heart-outline'}
                        size={28}
                        color={currentRoute === 'favorites' ? '#FA4E35' : '#fa4f3585'}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigateToTab('notifications')}
                    className="items-center justify-center flex-1"
                >
                    <Ionicons
                        name={currentRoute === 'notifications' ? 'notifications' : 'notifications-outline'}
                        size={28}
                        color={currentRoute === 'notifications' ? '#FA4E35' : '#fa4f3585'}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigateToTab('profile')}
                    className="items-center justify-center flex-1"
                >
                    <Ionicons
                        name={currentRoute === 'profile' ? 'person' : 'person-outline'}
                        size={28}
                        color={currentRoute === 'profile' ? '#FA4E35' : '#fa4f3585'}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

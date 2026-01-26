import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Venue } from '../../types';

interface SelectedVenueCardProps {
    venue: Venue;
    onClose: () => void;
}

export const SelectedVenueCard = ({ venue, onClose }: SelectedVenueCardProps) => {
    const router = useRouter();

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/(user)/venue/${venue.id}`)}
            className="absolute bottom-4 left-4 right-4 bg-[#1B1D37]/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10"
        >
            {venue.is_testing && (
                <View className="absolute top-0 right-0 z-50 bg-red-500 px-2 py-1 rounded-bl-xl rounded-tr-2xl">
                    <Text className="text-white text-[10px] font-bold">LOCAL DE PRUEBA</Text>
                </View>
            )}
            <View className="flex-row">
                {/* Logo Image (Left, Larger) */}
                <View className="mr-3">
                    {venue.logo_url ? (
                        <Image
                            source={{ uri: venue.logo_url }}
                            className="w-20 h-20 rounded-xl bg-surface-active"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-20 h-20 rounded-xl bg-surface-active items-center justify-center border border-white/5">
                            <Ionicons name="storefront" size={32} color="#6B7280" />
                        </View>
                    )}
                </View>

                {/* Content Info */}
                <View className="flex-1 justify-center">
                    {/* Tags/Badges Row */}
                    <View className="flex-row flex-wrap gap-2 mb-1">
                        {venue.category_name && (
                            <Text className="text-primary text-[10px] font-body-bold uppercase tracking-wider">
                                {venue.category_name}
                            </Text>
                        )}
                        {venue.verification_status === 'verified' && (
                            <View className="flex-row items-center">
                                <Ionicons name="checkmark-circle" size={10} color="#10B981" />
                                <Text className="text-success text-[10px] font-body-bold ml-1 uppercase">Verificado</Text>
                            </View>
                        )}
                    </View>

                    {/* Nombre - Protagonista */}
                    <Text className="text-foreground font-brand text-xl leading-tight mb-1" numberOfLines={1}>
                        {venue.name}
                    </Text>

                    {/* Address & Stats */}
                    <View className="space-y-1">
                        {venue.address_display && (
                            <Text className="text-foreground-muted text-xs font-body" numberOfLines={1}>
                                📍 {venue.address_display}
                            </Text>
                        )}
                        <View className="flex-row items-center space-x-3 mt-1">
                            <View className="flex-row items-center bg-surface-active/50 px-2 py-0.5 rounded-md">
                                <Ionicons name="star" size={12} color="#F59E0B" />
                                <Text className="text-foreground text-xs font-body-bold ml-1">
                                    {venue.rating_average > 0 ? venue.rating_average.toFixed(1) : 'New'}
                                </Text>
                            </View>

                            {venue.verified_visits_monthly > 0 && (
                                <Text className="text-foreground-muted text-xs font-body">
                                    🔥 {venue.verified_visits_monthly} visitas
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Arrow Action */}
                <View className="justify-center pl-2">
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

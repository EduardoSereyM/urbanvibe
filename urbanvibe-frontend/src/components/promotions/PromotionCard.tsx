import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Promotion } from '../../api/types';

interface PromotionCardProps {
    promotion: Promotion;
    onBoost?: () => void;
}

export function PromotionCard({ promotion, onBoost }: PromotionCardProps) {
    const isActive = promotion.is_active;
    const isHighlighted = promotion.is_highlighted;

    const typeLabel =
        promotion.promo_type === 'uv_reward' ? 'Recompensa UV' :
            'Promoción Estándar';

    const typeColor =
        promotion.promo_type === 'uv_reward' ? 'bg-accent-cyber/20 text-accent-cyber' :
            'bg-primary/20 text-primary';

    return (
        <View className={`bg-surface rounded-xl overflow-hidden mb-4 border ${isHighlighted ? 'border-accent-gold' : 'border-surface-active'}`}>
            {promotion.image_url && (
                <Image
                    source={{ uri: promotion.image_url }}
                    className="w-full h-32"
                    resizeMode="cover"
                />
            )}

            <View className="p-4">
                <View className="flex-row justify-between items-start mb-2">
                    <View className={`px-2 py-1 rounded-md self-start ${typeColor}`}>
                        <Text className={`text-xs font-brand-bold ${typeColor.split(' ')[1]}`}>
                            {typeLabel}
                        </Text>
                    </View>
                    {isHighlighted && (
                        <View className="bg-accent-gold/20 px-2 py-1 rounded-md flex-row items-center gap-1">
                            <Ionicons name="flash" size={12} color="#FFD700" />
                            <Text className="text-accent-gold text-xs font-brand-bold">Destacado</Text>
                        </View>
                    )}
                </View>

                <Text className="text-foreground font-brand-bold text-lg mb-1">
                    {promotion.title}
                </Text>

                {promotion.description && (
                    <Text className="text-foreground-muted font-body text-sm mb-3" numberOfLines={2}>
                        {promotion.description}
                    </Text>
                )}

                <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-surface-active">
                    <View className="flex-row items-center gap-4">
                        <View>
                            <Text className="text-foreground-muted text-xs">Estado</Text>
                            <Text className={`font-body-bold ${isActive ? 'text-success' : 'text-foreground-muted'}`}>
                                {isActive ? 'Activa' : 'Inactiva'}
                            </Text>
                        </View>
                        {promotion.promo_type === 'uv_reward' && (
                            <View>
                                <Text className="text-foreground-muted text-xs">Costo</Text>
                                <Text className="text-accent-cyber font-body-bold">
                                    {promotion.points_cost} pts
                                </Text>
                            </View>
                        )}
                    </View>

                    {onBoost && isActive && !isHighlighted && (
                        <TouchableOpacity
                            onPress={onBoost}
                            className="bg-accent-gold/10 px-3 py-2 rounded-lg flex-row items-center gap-1 border border-accent-gold/30"
                        >
                            <Ionicons name="rocket-outline" size={16} color="#FFD700" />
                            <Text className="text-accent-gold font-body-bold text-xs">Boost</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

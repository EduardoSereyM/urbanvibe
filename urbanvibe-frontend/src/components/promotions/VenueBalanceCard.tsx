import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VenueBalanceCardProps {
    balance: number;
    onHistoryPress?: () => void;
}

export function VenueBalanceCard({ balance, onHistoryPress }: VenueBalanceCardProps) {
    return (
        <View className="bg-surface-deep rounded-2xl p-5 border border-surface-active mb-6 relative overflow-hidden">
            {/* Background Decoration */}
            <View className="absolute -right-10 -top-10 w-32 h-32 bg-accent-cyber/10 rounded-full blur-2xl" />

            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-foreground-muted font-body text-sm uppercase tracking-wider">
                    Balance del Local
                </Text>
                <TouchableOpacity onPress={onHistoryPress}>
                    <Ionicons name="time-outline" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>

            <View className="flex-row items-baseline gap-2">
                <Text className="text-foreground font-brand-bold text-4xl">
                    {balance.toLocaleString()}
                </Text>
                <Text className="text-accent-cyber font-brand text-xl">UV Pts</Text>
            </View>

            <View className="mt-4 flex-row gap-3">
                <View className="flex-1 bg-surface/50 p-2 rounded-lg border border-white/5">
                    <Text className="text-foreground-muted text-xs mb-1">Ganados hoy</Text>
                    <Text className="text-success font-body-bold">+0</Text>
                </View>
                <View className="flex-1 bg-surface/50 p-2 rounded-lg border border-white/5">
                    <Text className="text-foreground-muted text-xs mb-1">Gastados hoy</Text>
                    <Text className="text-destructive font-body-bold">-0</Text>
                </View>
            </View>
        </View>
    );
}

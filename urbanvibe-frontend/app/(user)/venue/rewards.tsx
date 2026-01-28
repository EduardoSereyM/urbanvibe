import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RewardsScreen() {
    const router = useRouter();
    const { venueId, venueName } = useLocalSearchParams();

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(user)/(tabs)/explore');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-surface-active">
                <TouchableOpacity onPress={handleBack} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-foreground font-brand text-xl flex-1">Recompensas</Text>
            </View>

            {/* Content */}
            <View className="flex-1 items-center justify-center px-6">
                <View className="bg-surface rounded-3xl p-8 items-center border border-surface-active shadow-lg w-full max-w-sm">
                    {/* Icon */}
                    <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-6 border-2 border-primary/30">
                        <Ionicons name="construct-outline" size={48} color="#FA4E35" />
                    </View>

                    {/* Title */}
                    <Text className="text-foreground font-brand text-2xl text-center mb-3">
                        En Construcción
                    </Text>

                    {/* Description */}
                    <Text className="text-foreground-muted text-center font-body leading-relaxed mb-6">
                        Estamos trabajando en el sistema de recompensas para ofrecerte la mejor experiencia. ¡Pronto podrás canjear increíbles beneficios!
                    </Text>

                    {/* Venue Name if available */}
                    {venueName && (
                        <View className="bg-surface-active px-4 py-2 rounded-full border border-white/5">
                            <Text className="text-foreground-muted text-sm">
                                📍 {venueName}
                            </Text>
                        </View>
                    )}

                    {/* Coming Soon Badge */}
                    <View className="mt-6 bg-primary/20 px-6 py-2 rounded-full">
                        <Text className="text-primary font-brand text-sm">🚀 Próximamente</Text>
                    </View>
                </View>

                {/* Back Button */}
                <TouchableOpacity
                    onPress={handleBack}
                    className="mt-8 bg-surface-active px-8 py-3 rounded-full border border-white/10"
                >
                    <Text className="text-foreground font-body-bold">Volver al Local</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}


import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GamificationMenuScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const modules = [
        {
            title: 'Niveles',
            subtitle: 'Gestionar rangos y beneficios',
            icon: '🏆',
            route: '/(admin)/gamification/levels',
            color: 'bg-yellow-500/20'
        },
        {
            title: 'Insignias',
            subtitle: 'Catálogo de medallas',
            icon: '🎖️',
            route: '/(admin)/gamification/badges',
            color: 'bg-purple-500/20'
        },
        {
            title: 'Retos',
            subtitle: 'Desafíos temporales y reglas',
            icon: '⚡',
            route: '/(admin)/gamification/challenges',
            color: 'bg-blue-500/20'
        }
    ];

    return (
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="px-6 py-4 border-b border-border flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Text className="text-2xl text-foreground">←</Text>
                </TouchableOpacity>
                <View>
                    <Text className="font-heading text-xl text-foreground">Gamificación</Text>
                    <Text className="text-sm text-foreground-muted">Panel de Control</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {modules.map((module, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => router.push(module.route as any)}
                        className="bg-surface rounded-2xl p-4 mb-4 border border-border flex-row items-center"
                    >
                        <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${module.color}`}>
                            <Text className="text-2xl">{module.icon}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-lg text-foreground">{module.title}</Text>
                            <Text className="text-sm text-foreground-muted">{module.subtitle}</Text>
                        </View>
                        <Text className="text-foreground-muted">→</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

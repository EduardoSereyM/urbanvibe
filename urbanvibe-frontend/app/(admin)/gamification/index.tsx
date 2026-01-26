
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function GamificationMenuScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const modules = [
        {
            title: 'Niveles',
            subtitle: 'Rangos y Beneficios',
            icon: 'trophy-outline',
            route: '/(admin)/gamification/levels',
            borderColors: ['#00E0FF', '#0099FF'] as const, // Cyan Neon
            iconColor: '#00E0FF',
            iconBg: 'rgba(0, 224, 255, 0.1)'
        },
        {
            title: 'Insignias',
            subtitle: 'Catálogo de Medallas',
            icon: 'medal-outline',
            route: '/(admin)/gamification/badges',
            borderColors: ['#D946EF', '#9333EA'] as const, // Purple/Magenta Neon
            iconColor: '#D946EF',
            iconBg: 'rgba(217, 70, 239, 0.1)'
        },
        {
            title: 'Retos',
            subtitle: 'Desafíos Temporales',
            icon: 'flash-outline',
            route: '/(admin)/gamification/challenges',
            borderColors: ['#F97316', '#EA580C'] as const, // Orange Neon
            iconColor: '#F97316',
            iconBg: 'rgba(249, 115, 22, 0.1)'
        },
        {
            title: 'Reglas de Puntos',
            subtitle: 'Configuración Moneda',
            icon: 'settings-outline',
            route: '/(admin)/gamification/events',
            borderColors: ['#FACC15', '#CA8A04'] as const, // Yellow Neon
            iconColor: '#FACC15',
            iconBg: 'rgba(250, 204, 21, 0.1)'
        },
    ];

    return (
        <View className="flex-1 bg-[#1B1D37]" style={{ paddingTop: insets.top }}>
            {/* Background Glow */}
            <View className="absolute top-0 left-0 right-0 h-64 bg-purple-900/20 blur-3xl opacity-50" />

            {/* Header */}
            <View className="px-6 py-6 mb-2">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mb-6 border border-white/10"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <Text className="font-brand-bold text-4xl text-white mb-1 tracking-tight">
                    Gamificación
                </Text>
                <Text className="text-gray-400 font-body text-lg">
                    Panel de Control y Configuración
                </Text>
            </View>

            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {modules.map((module, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => router.push(module.route as any)}
                        activeOpacity={0.9}
                        className="mb-5 shadow-2xl"
                    >
                        {/* 1. Outer Glow/Border Gradient (Thinner = More Premium) */}
                        <LinearGradient
                            colors={module.borderColors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="p-[1px] rounded-[24px]" // Thinner border
                        >
                            {/* 2. Inner Card Background (Gradient for Depth, not Flat) */}
                            <LinearGradient
                                colors={['#2A3055', '#1F2440']} // Subtle dark gradient
                                className="rounded-[23px] p-5 flex-row items-center h-28"
                            >
                                {/* 3. Top Reflection (Glass Effect) */}
                                <View className="absolute top-0 left-0 right-0 h-1/2 bg-white/5 rounded-t-[23px]" />

                                {/* Icon Box with Glow */}
                                <View
                                    className="w-16 h-16 rounded-2xl items-center justify-center mr-5 shadow-lg relative overflow-hidden"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} // Darker base
                                >
                                    {/* Icon Inner Glow */}
                                    <View className="absolute inset-0 opacity-20" style={{ backgroundColor: module.iconColor }} />

                                    <Ionicons name={module.icon as any} size={30} color={module.iconColor} style={{ textShadowColor: module.iconColor, textShadowRadius: 10 }} />
                                </View>

                                {/* Texts */}
                                <View className="flex-1 justify-center z-10">
                                    <Text className="font-brand-bold text-xl text-white mb-1 tracking-wide">
                                        {module.title}
                                    </Text>
                                    <Text className="text-gray-400 font-body text-xs uppercase tracking-widest opacity-80">
                                        {module.subtitle}
                                    </Text>
                                </View>

                                {/* Chevron */}
                                <View className="w-8 h-8 rounded-full bg-white/5 items-center justify-center border border-white/5">
                                    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
                                </View>
                            </LinearGradient>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

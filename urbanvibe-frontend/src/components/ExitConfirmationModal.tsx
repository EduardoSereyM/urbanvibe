import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ContactModal } from './ContactModal';

interface ExitConfirmationModalProps {
    visible: boolean;
    onCancel: () => void;
    onLogout: () => void;
    onExit: () => void;
}

export function ExitConfirmationModal({ visible, onCancel, onLogout, onExit }: ExitConfirmationModalProps) {
    const [contactModalVisible, setContactModalVisible] = useState(false);

    // Official Brand Colors
    const COLORS = {
        background: '#1B1D37',
        orange: '#FF2A51', // Primary Action
        yellow: '#FFC000', // Support
        purpleDark: '#6313A1',
        blueNeon: '#00E0FF',
        logoutGrad: ['#3E4C59', '#351B60'] as const,
        exitGrad: ['#FF2A51', '#ff2a51a9'] as const, // Magenta gradient for exit
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <BlurView intensity={90} tint="dark" className="flex-1 justify-center items-center px-4">
                <TouchableWithoutFeedback onPress={onCancel}>
                    <View className="absolute inset-0 bg-black/40" />
                </TouchableWithoutFeedback>

                {/* Main Card with Brand Background */}
                <View className="w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-white/10">
                    <LinearGradient
                        colors={[COLORS.background, '#083D77']}
                        className="p-6 items-center"
                    >
                        {/* Header Icon Ring */}
                        <View className="mb-6 relative">
                            {/* Glow Effect */}
                            <View className="absolute inset-0 bg-[#FA4E35] opacity-20 blur-xl rounded-full scale-150" />
                            <View className="w-20 h-20 rounded-full bg-[#252A4A] items-center justify-center border-2 border-[#FA4E35] shadow-lg">
                                <Ionicons name="log-out" size={36} color={COLORS.orange} style={{ marginLeft: 4 }} />
                            </View>
                        </View>

                        <Text className="text-3xl font-brand-bold text-white text-center mb-3">
                            ¿Nos dejas?
                        </Text>
                        <Text className="text-gray-400 font-body text-center mb-8 px-4 text-base leading-6">
                            Selecciona una opción para continuar
                        </Text>

                        <View className="w-full space-y-4">
                            {/* Option 1: Salir de la App (High Impact - Magenta Gradient) */}
                            <TouchableOpacity onPress={onExit} activeOpacity={0.9} className="w-full shadow-lg scale-100">
                                <LinearGradient
                                    colors={COLORS.exitGrad}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="py-4 px-6 rounded-2xl flex-row items-center justify-between border border-white/10"
                                >
                                    <View className="flex-row items-center">
                                        <View className="bg-white/20 p-2 rounded-full mr-4">
                                            <Ionicons name="power" size={20} color="white" />
                                        </View>
                                        <Text className="text-white font-brand-bold text-lg">
                                            Salir de la App
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="white" opacity={0.8} />
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Option 2: Cerrar Sesión (Purple Gradient) */}
                            <TouchableOpacity onPress={onLogout} activeOpacity={0.9} className="mt-4 w-full shadow-lg">
                                <LinearGradient
                                    colors={COLORS.logoutGrad}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="py-4 px-6 rounded-xl flex-row items-center justify-between border border-white/10"
                                >
                                    <View className="flex-row items-center">
                                        <View className="bg-white/10 p-2 rounded-full mr-4">
                                            <Ionicons name="person-remove-outline" size={20} color={COLORS.orange} />
                                        </View>
                                        <Text className="color-[#FF2A51] font-brand text-lg">
                                            Cerrar Sesión
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="white" opacity={0.5} />
                                </LinearGradient>
                            </TouchableOpacity>

                        </View>

                        {/* Footer Support Link */}
                        <TouchableOpacity
                            onPress={() => setContactModalVisible(true)}
                            className="mt-8 flex-row items-center bg-[#1B1D37]/50 py-2 px-4 rounded-full border border-[#FFC000]/30"
                        >
                            <Ionicons name="chatbubbles-outline" size={16} color={COLORS.yellow} style={{ marginRight: 8 }} />
                            <Text style={{ color: COLORS.yellow }} className="font-body-bold text-sm">
                                ¿Problemas? Contáctanos
                            </Text>
                        </TouchableOpacity>

                        {/* Close X */}
                        <TouchableOpacity onPress={onCancel} className="absolute top-4 right-4 p-2">
                            <Ionicons name="close" size={24} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </BlurView>

            <ContactModal
                visible={contactModalVisible}
                onClose={() => setContactModalVisible(false)}
            />
        </Modal>
    );
}

import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { BackHandler, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExitConfirmationModal } from '../../src/components/ExitConfirmationModal';
import { supabase } from '../../src/lib/supabase';
import { useProfile } from '../../src/hooks/useProfile';

export default function AdminMenuScreen() {
    const router = useRouter();
    const [showExitModal, setShowExitModal] = useState(false);
    const { data: profile } = useProfile();

    const handleLogout = async () => {
        setShowExitModal(false);
        await supabase.auth.signOut();
        router.replace('/(auth)/login');
    };

    const handleExit = () => {
        setShowExitModal(false);
        BackHandler.exitApp();
    };

    const handleBackPress = () => {
        setShowExitModal(true);
        return true;
    };

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
            console.log("📍 [File: urbanvibe-frontend/app/(admin)/index.tsx] Current Screen: Admin Menu");
            return () => backHandler.remove();
        }, [])
    );

    return (
        <SafeAreaView className="flex-1 bg-background px-6">
            <View className="flex-1">
                <Text className="font-brand text-4xl text-foreground text-center mt-8">
                    Bienvenido
                </Text>
                <Text className="font-brand text-3xl text-primary text-center mb-4">
                    {profile?.username || 'Administrador'}
                </Text>

                <Text className="font-body text-foreground-muted text-center">
                    ¿Que vamos a administrar hoy?
                </Text>

                <View className="flex-1 justify-center mb-8">
                    {/* Opción 1: Panel de Locales (Admin) */}
                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/venues/list')}
                        className="bg-surface border-2 border-primary rounded-2xl p-6 mb-4"
                    >
                        <View className="flex-row items-center">
                            <Text className="text-4xl mr-4">🏪</Text>
                            <View className="flex-1">
                                <Text className="font-brand text-xl text-foreground mb-1">
                                    Panel de Locales
                                </Text>
                                <Text className="font-body text-sm text-foreground-muted">
                                    Ver y administrar todos los locales del sistema
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Opción 2: Panel de Usuarios */}
                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/users')}
                        className="bg-surface border-2 border-accent-cyber rounded-2xl p-6 mb-4"
                    >
                        <View className="flex-row items-center">
                            <Text className="text-4xl mr-4">👥</Text>
                            <View className="flex-1">
                                <Text className="font-brand text-xl text-foreground mb-1">
                                    Panel de Usuarios
                                </Text>
                                <Text className="font-body text-sm text-foreground-muted">
                                    Ver y administrar todos los usuarios del sistema
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Opción 3: Panel de Administración */}
                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/dashboard')}
                        className="bg-surface border-2 border-warning rounded-2xl p-6 mb-4"
                    >
                        <View className="flex-row items-center">
                            <Text className="text-4xl mr-4">⚙️</Text>
                            <View className="flex-1">
                                <Text className="font-brand text-xl text-foreground mb-1">
                                    Panel de Administración
                                </Text>
                                <Text className="font-body text-sm text-foreground-muted">
                                    Gestiona usuarios, locales y configuración global
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Opción 4: Crear Negocio */}
                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/venues/create')}
                        className="bg-surface border-2 border-success rounded-2xl p-6"
                    >
                        <View className="flex-row items-center">
                            <Text className="text-4xl mr-4">✨</Text>
                            <View className="flex-1">
                                <Text className="font-brand text-xl text-foreground mb-1">
                                    Crear Negocio
                                </Text>
                                <Text className="font-body text-sm text-foreground-muted">
                                    Dar de alta un nuevo local en la plataforma
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <ExitConfirmationModal
                    visible={showExitModal}
                    onCancel={() => setShowExitModal(false)}
                    onLogout={handleLogout}
                    onExit={handleExit}
                />
            </View>
        </SafeAreaView>
    );
}

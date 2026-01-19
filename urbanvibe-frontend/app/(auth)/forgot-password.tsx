import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleResetPassword() {
        if (!email) {
            Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://urbanvibe.app/reset-callback', // URL placeholder, importante configurar en Supabase
            });

            if (error) {
                Alert.alert('Error', error.message);
            } else {
                Alert.alert(
                    'Correo Enviado',
                    'Revisa tu bandeja de entrada para restablecer tu contraseña.',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <TouchableOpacity
                className="absolute top-12 left-6 z-10"
                onPress={() => router.back()}
            >
                <Ionicons name="chevron-back" size={28} color="#FA4E35" />
            </TouchableOpacity>

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -200}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="w-full items-center">
                        <Ionicons name="lock-open-outline" size={60} color="#FA4E35" style={{ marginBottom: 20 }} />

                        <Text className="font-brand text-3xl mb-4 text-center text-white">
                            Recuperar Contraseña
                        </Text>

                        <Text className="font-body text-gray-400 text-center mb-8 px-4">
                            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu acceso.
                        </Text>

                        <View className="w-full space-y-4">
                            <TextInput
                                className="bg-white text-black font-body mb-4 p-4 rounded-xl text-center text-lg"
                                placeholder="tu@correo.com"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                selectionColor="#FA4E35"
                            />

                            <TouchableOpacity
                                className={`bg-primary py-4 rounded-xl items-center shadow-lg mt-4 flex-row justify-center ${loading ? 'opacity-70' : ''}`}
                                onPress={handleResetPassword}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-body-bold text-lg">
                                        Enviar Instrucciones
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

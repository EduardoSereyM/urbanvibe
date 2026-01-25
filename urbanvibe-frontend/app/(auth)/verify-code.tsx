import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { client } from '../../src/api/client';

export default function VerifyCodeScreen() {
    const router = useRouter();
    const { email, username } = useLocalSearchParams<{ email: string, username?: string }>();

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    // Estados para Reenvío (Cooldown 60s)
    const [timeLeft, setTimeLeft] = useState(30); // Iniciamos con 30s de cortesía
    const [canResend, setCanResend] = useState(false);

    React.useEffect(() => {
        if (timeLeft === 0) {
            setCanResend(true);
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft((t) => t - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft]);

    async function handleResend() {
        if (!canResend) return;

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) throw error;

            Alert.alert('Código Enviado', `Se ha renviado un nuevo código a ${email}`);
            setTimeLeft(60); // Reiniciar cooldown
            setCanResend(false);

        } catch (error: any) {
            console.error('Error resending OTP:', error);
            Alert.alert('Error', error.message || 'No se pudo reenviar el código. Intenta más tarde.');
        }
    }

    async function handleVerify() {
        if (!code || code.length < 6) {
            Alert.alert('Error', 'El código debe tener 6 números exactos.');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: 'signup',
            });

            if (error) throw error;

            if (data.session) {
                // 🛠️ FIX MANUAL: Si el trigger de Supabase no guardó el username, lo hacemos nosotros aquí.
                if (username) {
                    console.log('🔄 Sincronizando username en perfil...', username);
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .update({ username: username }) // Escribimos directo en la BB.DD
                        .eq('id', data.session.user.id);

                    if (profileError) {
                        // Usamos warn en lugar de error para no mostrar la Pantalla Roja (LogBox) al usuario.
                        // El backend tiene un mecanismo de "Auto-Healing" que reparará esto automáticamente.
                        console.warn("⚠️ (Frontend) Update perfil bloqueado por RLS. Backend reparará.", profileError.message);
                    }
                }

                // Notificar verificación exitosa
                try {
                    console.log("🔔 Enviando notificación de usuario verificado...");
                    await client.post('/notifications/user-created', {
                        user_id: data.session.user.id,
                        email: email,
                        username: username || 'Nuevo Usuario',
                        role: 'APP_USER'
                    });
                } catch (err) {
                    console.log("⚠️ Error notificando usuario verificado:", err);
                }

                Alert.alert('¡Éxito!', 'Cuenta verificada correctamente.', [
                    {
                        text: 'Continuar',
                        onPress: () => router.replace('/(user)/(tabs)/explore')
                    }
                ]);
            } else {
                // Edge case?
                Alert.alert('Verificado', 'Tu cuenta ha sido verificada. Inicia sesión.');
                router.replace('/(auth)/login');
            }

        } catch (error: any) {
            console.error('Error verifying OTP:', error);
            Alert.alert('Error de Verificación', error.message || 'Código inválido o expirado');
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
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
                    <View className="items-center">
                        <View className="mb-6 bg-surface-active p-4 rounded-full">
                            <Ionicons name="key-outline" size={40} color="#FA4E35" />
                        </View>

                        <Text className="font-brand text-3xl mb-2 text-center text-white">
                            Código de Acceso
                        </Text>

                        <Text className="font-body text-gray-400 text-center mb-8 px-4">
                            Hemos enviado un código a <Text className="text-white font-bold">{email}</Text>.{'\n'}
                            Ingrésalo para desbloquear tu cuenta.
                        </Text>

                        <View className="mb-8 bg-surface-active/50 px-4 py-2 rounded-lg border border-yellow-500/20">
                            <Text className="text-yellow-500/90 text-xs text-center font-body">
                                💡 Tip: Si no recibes el código en unos segundos, revisa tu carpeta de Spam o "Correo No Deseado".
                            </Text>
                        </View>

                        <TextInput
                            className="bg-surface-active text-white font-code text-3xl p-4 rounded-xl text-center tracking-[12px] w-full mb-8 border border-white/10 focus:border-primary"
                            placeholder="000000"
                            placeholderTextColor="#4B5563"
                            value={code}
                            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ''))}
                            keyboardType="number-pad"
                            maxLength={6}
                            autoFocus
                        />

                        <TouchableOpacity
                            className={`w-full bg-primary py-4 rounded-xl items-center shadow-lg ${loading ? 'opacity-70' : ''}`}
                            onPress={handleVerify}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-body-bold text-lg">
                                    Verificar Código
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="mt-6 p-2"
                            onPress={handleResend}
                            disabled={!canResend}
                        >
                            <Text className={`font-body text-sm text-center ${canResend ? 'text-primary font-bold' : 'text-gray-500'}`}>
                                {canResend
                                    ? "¿No recibiste el código? Reenviar ahora"
                                    : `Reenviar código en ${timeLeft}s`
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

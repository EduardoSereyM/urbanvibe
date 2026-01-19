import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { client } from '../../src/api/client';

export default function RegisterUserScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [invitationCode, setInvitationCode] = useState('');

    function validatePassword(pass: string) {
        // Reglas: Min 8 chars, Lower, Upper, Digit, Symbol
        const minLength = /.{8,}/;
        const lowerCase = /[a-z]/;
        const upperCase = /[A-Z]/;
        const digit = /[0-9]/;
        const symbol = /[!@#$%^&*(),.?":{}|<>]/;

        if (!minLength.test(pass)) return "La contraseña debe tener al menos 8 caracteres.";
        if (!lowerCase.test(pass)) return "Debe incluir al menos una letra minúscula.";
        if (!upperCase.test(pass)) return "Debe incluir al menos una letra mayúscula.";
        if (!digit.test(pass)) return "Debe incluir al menos un número.";
        if (!symbol.test(pass)) return "Debe incluir al menos un símbolo (!@#$).";

        return null;
    }

    async function handleRegister() {
        if (!email || !password || !fullName || !username) {
            Alert.alert('Error', 'Por favor completa todos los campos, incluyendo el usuario.');
            return;
        }

        if (fullName.length < 5 || username.length < 5) {
            Alert.alert('Campos muy cortos', 'El nombre y el usuario deben tener al menos 5 caracteres.');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            Alert.alert('Contraseña Insegura', passwordError);
            return;
        }

        setLoading(true);
        try {
            // 1. Crear usuario en Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        username: username, // CRITICAL: Mandatory Username
                        role: 'APP_USER',
                        invitation_code: invitationCode || null // Enviamos el código si existe
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // Bloque vacío o log
                console.log("Usuario creado, verificando sesión...");
            }

            if (authData.session) {
                // Login automático exitoso
                try {
                    console.log("🔔 Enviando notificación de nuevo usuario (Auto-Login)...");
                    await client.post('/notifications/user-created', {
                        user_id: authData.session.user.id,
                        email: email,
                        username: username,
                        role: 'APP_USER',
                        invitation_code: invitationCode || null
                    });
                } catch (err) {
                    console.log("⚠️ Error notificando usuario:", err);
                }

                Alert.alert('¡Bienvenido!', 'Tu cuenta ha sido creada exitosamente.');
                router.replace('/(user)/(tabs)/explore');
            } else {
                // Caso: Confirmación de email requerida (OTP)
                // Alert.alert('Verifica tu correo', 'Te hemos enviado un código para confirmar tu cuenta.');
                router.push({
                    pathname: '/(auth)/verify-code',
                    params: { email, username } // Pasamos username para asegurar guardado
                });
            }

        } catch (error: any) {
            console.error('Error de registro:', error);
            if (error.message?.includes('already registered') || error.status === 400) {
                Alert.alert('Correo ya registrado', 'Este correo ya está en uso. Por favor inicia sesión.');
            } else {
                Alert.alert('Error al registrarse', error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 400 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-1 justify-center items-center mt-8">
                        {/* Header Visual - Social Vibe */}
                        <View className="bg-primary/80 p-6 rounded-full mb-6 border border-primary/30">
                            <Ionicons name="rocket" size={48} color="#F2F1F0" />
                        </View>

                        <Text className="text-primary font-brand text-4xl mb-2 text-center">
                            Tu Pasaporte{'\n'}Urbano
                        </Text>
                        <Text className="text-foreground-muted font-body text-lg mb-10 text-center px-6">
                            Únete a la comunidad y desbloquea las mejores experiencias de la ciudad.
                        </Text>
                    </View>

                    <View className="space-y-4">
                        <View>
                            <Text className="text-foreground font-body-semibold mb-2 ml-1">Tu Nombre Completo</Text>
                            <TextInput
                                className="text-foreground font-body p-4 rounded-xl border border-surface-active focus:border-primary"
                                style={{ backgroundColor: 'hsl(233, 43%, 24%)', color: 'hsl(210, 5%, 95%)' }}
                                placeholder="Juan Pérez"
                                placeholderTextColor="#828BA0"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

                        <View>
                            <Text className="text-foreground font-body-semibold mb-2 ml-1">Nombre de Usuario (como te llamaremos en la app)</Text>
                            <TextInput
                                className="text-foreground font-body p-4 rounded-xl border border-surface-active focus:border-primary"
                                style={{ backgroundColor: 'hsl(233, 43%, 24%)', color: 'hsl(210, 5%, 95%)' }}
                                placeholder="juanpereznoctuno"
                                placeholderTextColor="#828BA0"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        <View>
                            <Text className="text-foreground font-body-semibold mb-2 ml-1">Email</Text>
                            <TextInput
                                className="text-foreground font-body p-4 rounded-xl border border-surface-active focus:border-primary"
                                style={{ backgroundColor: 'hsl(233, 43%, 24%)', color: 'hsl(210, 5%, 95%)' }}
                                placeholder="ejemplo@correo.com"
                                placeholderTextColor="#828BA0"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View>
                            <Text className="text-foreground font-body-semibold mb-2 ml-1">Contraseña</Text>
                            <View className="relative justify-center">
                                <TextInput
                                    className="text-foreground font-body p-4 rounded-xl border border-surface-active focus:border-primary pr-12"
                                    style={{ backgroundColor: 'hsl(233, 43%, 24%)', color: 'hsl(210, 5%, 95%)' }}
                                    placeholder="••••••••"
                                    placeholderTextColor="#828BA0"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 p-2"
                                >
                                    <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#828BA0" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View>
                            <View className="flex-row items-center mb-2 ml-1">
                                <Ionicons name="gift-outline" size={16} color="#FA4E35" />
                                <Text className="text-foreground font-body-semibold ml-2">¿Tienes un código de invitación?</Text>
                            </View>
                            <TextInput
                                className="text-foreground font-body p-4 rounded-xl border border-surface-active focus:border-primary"
                                style={{ backgroundColor: 'hsl(233, 43%, 24%)', color: 'hsl(210, 5%, 95%)' }}
                                placeholder="CÓDIGO (OPCIONAL)"
                                placeholderTextColor="#828BA0"
                                value={invitationCode}
                                onChangeText={setInvitationCode}
                                autoCapitalize="characters"
                            />
                        </View>

                        <TouchableOpacity
                            className={`bg-primary py-4 rounded-full items-center shadow-lg mt-6 ${loading ? 'opacity-70' : ''}`}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text className="text-primary-foreground font-brand text-lg">
                                {loading ? 'Creando cuenta...' : 'Registrarse'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-8 flex-row justify-center">
                        <Text className="text-foreground-muted font-body">¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text className="text-primary font-body-bold">Inicia Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    );
}

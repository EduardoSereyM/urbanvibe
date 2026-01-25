import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { client, updateProfile } from '../../src/api/client';
import { LocationSelector } from '../../src/components/LocationSelector';

export default function RegisterVenueScreen() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [invitationCode, setInvitationCode] = useState('');

    // Location
    const [countryCode, setCountryCode] = useState('CL');
    const [regionId, setRegionId] = useState<number | undefined>(undefined);
    const [cityId, setCityId] = useState<number | undefined>(undefined);

    // Invitation Validation
    const [invitationStatus, setInvitationStatus] = useState<'valid' | 'invalid' | null>(null);
    const [invitationOwner, setInvitationOwner] = useState('');

    const validateInvitation = async (code: string) => {
        if (!code) {
            setInvitationStatus(null);
            return;
        }
        try {
            const res = await client.get(`/invitations/validate/${code}`);
            if (res.data.valid) {
                setInvitationStatus('valid');
                setInvitationOwner(res.data.owner_name || 'Partner');
            } else {
                setInvitationStatus('invalid');
            }
        } catch (error) {
            setInvitationStatus('invalid');
        }
    };

    const validatePassword = (pass: string) => {
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
    };

    const handleRegister = async () => {
        // Validación estricta de campos obligatorios
        if (!email || !password || !fullName || !username) {
            Alert.alert('Campos incompletos', 'Nombre, Usuario, Email y Contraseña son obligatorios.');
            return;
        }

        if (fullName.length < 5 || username.length < 5) {
            Alert.alert('Detalle requerido', 'El nombre y el usuario deben tener al menos 5 caracteres.');
            return;
        }

        if (!countryCode) {
            Alert.alert('Falta Ubicación', 'Debes seleccionar un País.');
            return;
        }
        if (!regionId) {
            Alert.alert('Falta Ubicación', 'Debes seleccionar una Región.');
            return;
        }
        if (!cityId) {
            Alert.alert('Falta Ubicación', 'Debes seleccionar tu Comuna para continuar.');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            Alert.alert('Seguridad de Contraseña', passwordError);
            return;
        }

        setLoading(true);
        try {
            console.log('🚀 Iniciando registro de Partner:', email);

            // Crear usuario en Auth con metadata de Partner
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        username: username,
                        role: 'VENUE_OWNER', // ROL CRÍTICO
                    },
                },
            });

            if (authError) throw authError;

            if (authData.session) {
                // Login exitoso directo
                try {
                    const { client } = require('../../src/api/client'); // Import dynamic if needed
                    await client.post('/notifications/user-created', {
                        user_id: authData.session.user.id,
                        email: email,
                        username: username,
                        role: 'VENUE_OWNER',
                        invitation_code: invitationCode || null
                    });

                    // 2. Update Profile with Location (Explicitly)
                    console.log("📍 Updating venue owner profile location...");
                    await updateProfile({
                        country_code: countryCode,
                        region_id: regionId,
                        city_id: cityId
                    });

                } catch (e) {
                    console.log("Error notifying venue owner creation", e);
                }

                router.replace('/(venue)');
            } else {
                // Flujo OTP (Confirmación requerida)
                router.push({
                    pathname: '/(auth)/verify-code',
                    params: { email, username } // Pasamos username para asegurar guardado
                });
            }

        } catch (error: any) {
            console.error('❌ Error registro partner:', error);
            if (error.message?.includes('already registered') || error.status === 400) {
                Alert.alert('Aviso', 'Este correo ya está registrado. Intenta iniciar sesión.');
            } else {
                Alert.alert('Error', error.message || 'No se pudo crear la cuenta.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isFormValid =
        email.trim() !== '' &&
        password.trim() !== '' &&
        fullName.trim() !== '' &&
        username.trim() !== '' &&
        isConfirmed;

    return (
        <SafeAreaView className="flex-1 bg-background">
            <TouchableOpacity
                className="absolute top-12 left-6 z-10"
                onPress={() => router.back()}
            >
                <Ionicons name="chevron-back" size={28} color="#FA4E35" />
            </TouchableOpacity>

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
                    <View className="mt-6 mb-8 items-center">
                        {/* Header Visual - Cyber Partner */}
                        <View className="bg-accent-cyber/10 p-6 rounded-2xl mb-6 border border-accent-cyber/30 shadow-lg shadow-accent-cyber/20">
                            <Ionicons name="briefcase" size={48} color="#00F0FF" />
                        </View>

                        <Text className="text-accent-cyber font-brand text-3xl mb-2 text-center">
                            Portal Partners
                        </Text>
                        <Text className="text-foreground-muted font-body text-lg text-center px-4">
                            Gestiona tus locales, analiza métricas y conecta con tu audiencia.
                        </Text>
                    </View>

                    <View className="space-y-4">
                        {/* Nombre Completo */}
                        <View>
                            <Text className="text-foreground font-body-semibold mb-2 ml-1">Nombre Completo (Admin)</Text>
                            <TextInput
                                className="text-foreground font-body p-4 rounded-xl border border-surface-active focus:border-accent-cyber"
                                style={{ backgroundColor: 'hsl(233, 43%, 24%)', color: 'hsl(210, 5%, 95%)' }}
                                placeholder="Ej: Roberto Dueño"
                                placeholderTextColor="#4B5563"
                                cursorColor="#00F0FF"
                                value={fullName}
                                onChangeText={setFullName}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Username */}
                        <View>
                            <Text className="text-foreground font-body-semibold mt-4 mb-2 ml-1">Usuario (@usuario)</Text>
                            <TextInput
                                className="text-foreground font-body p-4 rounded-xl border border-surface-active focus:border-accent-cyber"
                                style={{ backgroundColor: 'hsl(233, 43%, 24%)', color: 'hsl(210, 5%, 95%)' }}
                                placeholder="roberto_club"
                                placeholderTextColor="#828BA0"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Email */}
                        <View>
                            <Text className="text-foreground font-body-semibold mt-4 mb-2 ml-1">Email Corporativo</Text>
                            <TextInput
                                className="text-foreground font-body p-4 rounded-xl border border-surface-active focus:border-accent-cyber"
                                style={{ backgroundColor: 'hsl(233, 43%, 24%)', color: 'hsl(210, 5%, 95%)' }}
                                placeholder="contacto@club.com"
                                placeholderTextColor="#828BA0"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        {/* Password */}
                        <View>
                            <Text className="text-foreground font-body-semibold mt-4 mb-2 ml-1">Contraseña</Text>
                            <View className="relative justify-center">
                                <TextInput
                                    className="text-foreground font-body p-4 rounded-xl border border-surface-active focus:border-accent-cyber pr-12"
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

                    </View>

                    {/* Invitation Code (New) */}
                    <View>
                        <View className="flex-row items-center mt-4 mb-2 ml-1">
                            <Ionicons name="gift-outline" size={16} color="#00F0FF" />
                            <Text className="text-foreground font-body-semibold ml-2">¿Tienes un código de invitación?</Text>
                        </View>
                        <View className="relative justify-center">
                            <TextInput
                                className={`text-foreground font-body p-4 rounded-xl border ${invitationStatus === 'valid' ? 'border-green-500' : invitationStatus === 'invalid' ? 'border-red-500' : 'border-surface-active'} focus:border-accent-cyber`}
                                style={{ backgroundColor: 'hsl(233, 43%, 24%)', color: 'hsl(210, 5%, 95%)' }}
                                placeholder="CÓDIGO (OPCIONAL)"
                                placeholderTextColor="#828BA0"
                                value={invitationCode}
                                onChangeText={(t) => {
                                    setInvitationCode(t);
                                    if (t === '') setInvitationStatus(null);
                                }}
                                onBlur={() => validateInvitation(invitationCode)}
                                autoCapitalize="characters"
                            />
                            {invitationStatus === 'valid' && (
                                <View className="absolute right-4 bg-green-500/20 p-1 rounded-full">
                                    <Ionicons name="checkmark" size={20} color="#22c55e" />
                                </View>
                            )}
                            {invitationStatus === 'invalid' && (
                                <View className="absolute right-4 bg-red-500/20 p-1 rounded-full">
                                    <Ionicons name="close" size={20} color="#ef4444" />
                                </View>
                            )}
                        </View>
                        {invitationStatus === 'invalid' && (
                            <Text className="text-red-500 text-xs ml-1 mt-1 font-body">Código no encontrado o expirado</Text>
                        )}
                        {invitationStatus === 'valid' && (
                            <Text className="text-green-500 text-xs ml-1 mt-1 font-body">Código válido: {invitationOwner}</Text>
                        )}
                    </View>


                    <View className="mt-6 p-4 border-2 border-solid border-accent-cyber rounded-xl bg-surface-deep/50">
                        <Text className="text-accent-cyber font-brand text-lg mb-2 text-center">Ubicación del Local</Text>
                        <LocationSelector
                            countryCode={countryCode}
                            regionId={regionId}
                            cityId={cityId}
                            onCountryChange={(c) => { setCountryCode(c); setRegionId(undefined); setCityId(undefined); }}
                            onRegionChange={(r) => { setRegionId(r); setCityId(undefined); }}
                            onCityChange={(c) => setCityId(c)}
                            labelColor='text-foreground font-body-semibold ml-1'
                        />
                    </View>

                    {/* Terms & Confirmation Checkbox */}
                    <TouchableOpacity
                        className="flex-row items-start mt-4 mb-2"
                        onPress={() => setIsConfirmed(!isConfirmed)}
                    >
                        <View className={`w-6 h-6 rounded border ${isConfirmed ? 'bg-accent-cyber border-accent-cyber' : 'border-gray-500'} items-center justify-center mr-3 mt-1`}>
                            {isConfirmed && <Ionicons name="checkmark" size={16} color="white" />}
                        </View>
                        <Text className="flex-1 text-foreground-muted text-sm leading-5">
                            Declaro que soy dueño/administrador de un local establecido y poseo la documentación legal que lo acredita.
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`bg-accent-cyber py-4 rounded-full items-center shadow-lg mt-4 ${loading || !isFormValid ? 'opacity-50' : ''}`}
                        onPress={handleRegister}
                        disabled={loading || !isFormValid}
                    >
                        <Text className="text-white font-brand text-lg">
                            {loading ? 'Creando cuenta...' : 'Comenzar'}
                        </Text>
                    </TouchableOpacity>


                    <View className="mt-8 flex-row justify-center pb-8">
                        <Text className="text-foreground-muted font-body">¿Ya eres Partner? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login?type=business')}>
                            <Text className="text-accent-cyber font-body-bold">Inicia Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    );
}

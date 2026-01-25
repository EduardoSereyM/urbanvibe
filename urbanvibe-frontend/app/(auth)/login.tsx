import { useLocalSearchParams, useRouter } from 'expo-router';
// import * as WebBrowser from 'expo-web-browser';
// import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { client } from '../../src/api/client';
import { supabase } from '../../src/lib/supabase';

// Assets
const LOGO_SOURCE = require('../../assets/images/urbanvibe-logo.png');

export default function LoginScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const loginType = params.type === 'business' ? 'business' : 'user';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Auto-detectar sesión al cargar (ej: al volver del callback de Google)
    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                console.log('⚡ Sesión detectada al montar Login. Ejecutando post-login...');
                setLoading(true);
                handlePostLogin();
            }
        });
    }, []);



    async function signInWithEmail() {
        if (!email || !password) {
            Alert.alert('Datos Incompletos', 'Por favor ingresa tu correo electrónico y contraseña.');
            return;
        }

        setLoading(true);

        try {


            // -----------------------------------------------------------
            // 2. Intento de Login Real
            // -----------------------------------------------------------
            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                let errorMessage = 'Ocurrió un error al iniciar sesión. Intenta nuevamente.';
                let errorTitle = 'Error de Autenticación';

                // Traducción de errores comunes de Supabase
                if (error.message.includes('Invalid login credentials')) {
                    // Si llegamos aquí y ya validamos el correo (o si la validación falló pero el login también),
                    // es muy probable que sea la contraseña.
                    errorMessage = 'La contraseña ingresada es incorrecta.';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = 'Tu correo electrónico no ha sido confirmado. Por favor revisa tu bandeja de entrada.';
                    errorTitle = 'Correo no verificado';
                }

                Alert.alert(errorTitle, errorMessage);
                setLoading(false);
                return;
            }

            // Login exitoso
            console.log('✅ Login exitoso, detectando rol...');
            await handlePostLogin();

        } catch (err) {
            console.error('Unexpected login error:', err);
            Alert.alert('Error', 'Ocurrió un error inesperado. Por favor intenta nuevamente.');
            setLoading(false);
        }
    }

    async function handlePostLogin() {
        try {
            // Obtener sesión actual
            const { data: { session } } = await supabase.auth.getSession();
            console.log('📧 Email del usuario:', session?.user?.email);

            // -----------------------------------------------------------
            // FIX: Forzamos la obtención del perfil desde la API
            // para evitar problemas con Tokens antiguos sin claims
            // -----------------------------------------------------------
            console.log('🔄 Obteniendo perfil actualizado desde API...');

            // Usamos supabase.from() directament para evitar problemas con axios interceptors si la sesión no está lista
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session?.user?.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.warn('⚠️ Perfil no encontrado (PGRST116). El usuario existe en Auth pero no en public.profiles.');
                    Alert.alert('Creando perfil...', 'Tu cuenta se está terminando de configurar. Por favor intenta ingresar nuevamente en unos segundos.');
                } else {
                    console.error('❌ Error obteniendo perfil:', error);
                    Alert.alert('Error', 'No se pudo cargar tu perfil.');
                }
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            if (!profile) {
                // Caso extra de seguridad, aunque error debería saltar antes
                Alert.alert('Error', 'Perfil no encontrado.');
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            const roleId = profile.role_id;
            console.log('🚀 Login -> Role ID (DB):', roleId);

            switch (roleId) {
                case 1: // SUPER_ADMIN
                    console.log('👑 Redirigiendo a Admin Panel');
                    setLoading(false);
                    if (router.canDismiss()) router.dismissAll();
                    router.replace('/(admin)');
                    break;

                case 2: // VENUE_OWNER
                case 3: // VENUE_MANAGER
                    console.log('🏢 Redirigiendo a Business Dashboard');
                    setLoading(false);
                    if (router.canDismiss()) router.dismissAll();
                    router.replace('/(venue)');
                    break;

                case 4: // VENUE_STAFF
                    console.log('🎫 Redirigiendo a Scanner/Staff Area');
                    setLoading(false);
                    if (router.canDismiss()) router.dismissAll();
                    router.replace('/(venue)');
                    break;

                case 5: // APP_USER
                default:
                    console.log('👤 Redirigiendo a Explore');
                    setLoading(false);
                    if (router.canDismiss()) router.dismissAll();
                    router.replace('/(user)/(tabs)/explore');
                    break;
            }
            return;

        } catch (error: any) {
            console.log('❌ Error general en post-login:', error);
            setLoading(false);
            Alert.alert(
                'Error de Inicio de Sesión',
                'Ocurrió un problema validando tu sesión. Intenta nuevamente.'
            );
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Back Button */}
            <TouchableOpacity
                className="absolute top-12 left-6 z-10"
                onPress={() => {
                    if (router.canGoBack()) router.back();
                    else router.replace('/');
                }}
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
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 150 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <View className="items-center justify-center py-20">
                            <ActivityIndicator size="large" color="#FA4E35" />
                            <Text className="text-foreground font-body mt-6 text-lg text-center">
                                Conectando urbanVibe...
                            </Text>
                        </View>
                    ) : (
                        <View className="w-full items-center">
                            {/* Header / Logo */}
                            <View className="items-center my-8">
                                <Text className="font-brand text-6xl my-6 text-center">
                                    <Text className="text-white">urban</Text>
                                    <Text className="text-primary">Vibe</Text>
                                </Text>

                                <Text className="font-brand text-success text-xl tracking-wide mb-1 text-center">
                                    Descubramos la Ciudad
                                </Text>

                                <Text className="font-brand text-foreground text-lg tracking-wide text-center uppercase mb-6 px-2">
                                    {loginType === 'business' ? 'Accede a tu cuenta de Negocio' : 'Accede a tu cuenta'} {'\n'}
                                </Text>



                                <TouchableOpacity onPress={() => {
                                    if (loginType === 'business') {
                                        router.push('/(auth)/register-venue');
                                    } else {
                                        router.push('/(auth)/register-user');
                                    }
                                }}>
                                    <Text className="font-body-bold text-foreground text-sm text-center mb-4">
                                        {loginType === 'business' ? '¿No tienes cuenta de negocio?' : '¿No tienes cuenta?'}{'\n'}
                                        <Text className="text-primary">Créala aquí</Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Formulario */}
                            <View className="w-full space-y-4">
                                <View>
                                    <TextInput
                                        className="bg-white text-black font-body mb-2 p-4 rounded-xl text-center text-lg"
                                        placeholder="usuario / correo"
                                        placeholderTextColor="#9CA3AF"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        selectionColor="#FA4E35"
                                    />
                                </View>

                                <View>
                                    <View className="relative justify-center">
                                        <TextInput
                                            className="bg-white text-black font-body p-4 rounded-xl text-center text-lg"
                                            placeholder="contraseña"
                                            placeholderTextColor="#9CA3AF"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                            selectionColor="#FA4E35"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 p-2"
                                        >
                                            <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} className="items-end mt-2">
                                        <Text className="text-gray-400 font-body text-sm underline">
                                            ¿Olvidaste tu contraseña?
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    className={`bg-white py-4 rounded-xl items-center shadow-lg mt-6 flex-row justify-center ${loading ? 'opacity-70' : ''}`}
                                    onPress={signInWithEmail}
                                    disabled={loading}
                                >
                                    <Text className="text-primary font-body-bold text-lg mr-2">
                                        Continuar
                                    </Text>
                                    <Ionicons name="chevron-forward" size={20} color="#FA4E35" />
                                </TouchableOpacity>
                            </View>

                            {/* Divider Line */}
                            <View className="w-full h-[1px] bg-warning/50 my-6" />

                            {/* Social Logins Eliminados por solicitud */}


                            {/* Footer Terms */}
                            <Text className="text-foreground-muted text-xs text-center px-4 mb-4">
                                Al hacer clic en continuar, aceptas nuestros{' '}
                                <Text className="text-white">Términos de servicio</Text> y <Text className="text-primary">Política de privacidad de urbanVibe</Text>
                            </Text>

                            {/* Business Access */}
                            {/* <TouchableOpacity
                                className="flex-row items-center mt-4"
                                onPress={() => router.push('/(auth)/login?type=business')}
                            >
                                <Text className="text-xl mr-2">🏢</Text>
                                <Text className="text-warning font-body-bold text-lg">Acceso Business</Text>
                            </TouchableOpacity> */}

                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

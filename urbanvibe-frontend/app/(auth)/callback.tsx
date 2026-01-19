import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';

export default function AuthCallbackScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    useEffect(() => {
        // Intentar obtener el parámetro 'type' de la URL original si es posible
        // En Expo Router, los query params a veces vienen en params directamente
        const loginType = params.type || 'user';
        console.log('🔄 Callback recibido. Type:', loginType);

        // Verificar sesión
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                console.log('✅ Sesión detectada en callback. Redirigiendo al gate...');
                // Redirigimos al login para que procese el rol, pasando el tipo
                // O podríamos ir directo a auth-gate, pero login.tsx tiene la lógica de roles más completa ahora.
                // Vamos a usar login.tsx para que ejecute handlePostLogin automáticamente si ya hay sesión?
                // Mejor: Vamos a login con el type, y login detectará sesión y ejecutará handlePostLogin.
                router.replace(`/(auth)/login?type=${loginType}`);
            } else {
                console.log('⚠️ No hay sesión aún. Redirigiendo a login...');
                router.replace(`/(auth)/login?type=${loginType}`);
            }
        });
    }, [params]);

    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <ActivityIndicator size="large" color="#FA4E35" />
            <Text className="text-foreground font-body mt-4">Procesando ingreso...</Text>
        </SafeAreaView>
    );
}

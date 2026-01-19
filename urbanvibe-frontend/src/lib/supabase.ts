// src/lib/supabase.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validación robusta para evitar crasheos si faltan las keys
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '❌ Error Crítico: Faltan variables de entorno de Supabase.\n' +
        'Asegúrate de tener un archivo .env con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
}

// Exportamos una instancia, incluso si es inválida, para que la app no explote al importar este archivo.
// En caso de faltar keys, las operaciones fallarán, pero el Metro bundler no morirá en el arranque.
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    }
);

// Escuchar cambios de estado de la app para refrescar sesión
// Escuchar cambios de estado de la app para refrescar sesión
AppState.addEventListener('change', async (state) => {
    console.log(`📱 AppState changed to: ${state}`);
    if (state === 'active') {
        try {
            console.log('🔄 Intentando auto-refresh de sesión...');
            // Intentar iniciar el auto-refresh
            await supabase.auth.startAutoRefresh();
            console.log('✅ Auto-refresh iniciado correctamente.');
        } catch (error: any) {
            console.error('⚠️ Error al iniciar auto-refresh en AppState change:', error);

            // Si el error es de token inválido, forzar limpieza
            if (error?.message?.includes('Invalid Refresh Token') ||
                error?.message?.includes('Refresh Token Not Found')) {
                console.log('🔄 Token inválido detectado. Limpiando sesión local...');
                await AsyncStorage.removeItem('supabase.auth.token'); // Limpieza manual backup
                await supabase.auth.signOut();
            }
        }
    } else {
        supabase.auth.stopAutoRefresh();
        console.log('⏸️ Auto-refresh detenido (Background).');
    }
});

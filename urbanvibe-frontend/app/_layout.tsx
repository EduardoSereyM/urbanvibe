import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import {
  Lexend_900Black,
} from '@expo-google-fonts/lexend';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import '../global.css';
import * as SystemUI from 'expo-system-ui';
import * as Linking from 'expo-linking';
import { supabase } from '../src/lib/supabase';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Set the native root view background color immediately
SystemUI.setBackgroundColorAsync('#1B1D37');

const queryClient = new QueryClient();

// Define custom theme matching the app's design
const UrbanVibeTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#1B1D37', // La Noche UV
  },
};

import { NotificationProvider } from '../src/context/NotificationContext';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Lexend_900Black,
    Inter_800ExtraBold,
    Inter_600SemiBold,
    Inter_400Regular,
  });

  // Handle Deep Links for Supabase Auth
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      const createSessionFromUrl = async (url: string) => {
        try {
          // Parse URL parameters (hash or query)
          // Supabase sends tokens in the hash: #access_token=...&refresh_token=...
          const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        } catch (e) {
          console.error('Error parsing Supabase URL:', e);
        }
      };
      createSessionFromUrl(url);
    }
  }, [url]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Debug: Monitor Navigation Path
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      console.log('📱 [PANTALLA ACTUAL]:', pathname);
    }
  }, [pathname]);

  // Debug: Verificar vitalidad del JS Thread
  useEffect(() => {
    const interval = setInterval(() => {
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" backgroundColor="#1B1D37" />
      <NotificationProvider>
        <ThemeProvider value={UrbanVibeTheme}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#1B1D37' } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="(public)" />
            <Stack.Screen name="(user)" />
            <Stack.Screen name="(venue)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </ThemeProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

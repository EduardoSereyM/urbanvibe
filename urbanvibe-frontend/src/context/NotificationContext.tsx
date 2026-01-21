import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { registerDeviceToken } from '../api/client';

// Configuración global de notificaciones
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

interface NotificationContextType {
    expoPushToken: string | undefined;
    notification: Notifications.Notification | undefined;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
    const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

    const registerForPushNotificationsAsync = async () => {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FA4E35',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Permission not granted to get push token for push notification!');
                return;
            }

            try {
                const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
                if (!projectId) {
                    token = (await Notifications.getExpoPushTokenAsync()).data;
                } else {
                    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
                }
                console.log('📢 Expo Push Token:', token);
            } catch (e: any) {
                // Manejo específico para limitación de Expo Go en SDK 53+ (Android)
                if (e.message?.includes('Expo Go') || e.message?.includes('expo-notifications')) {
                    console.warn('⚠️ Push Notifications no soportadas en Expo Go (Android). Usando modo In-App solamente.');
                } else {
                    console.error("Error getting push token:", e);
                }
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    };

    useEffect(() => {
        // 1. Register Token Logic
        registerForPushNotificationsAsync().then(async (token) => {
            setExpoPushToken(token);
            if (token) {
                // Enviar token al backend si hay sesión activa
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await registerDeviceToken(token, Platform.OS);
                }
            }
        });

        // 2. Listeners
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
            // Aquí podríamos actualizar un unreadCount global o Toast
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('🔔 Notification Interaction:', response);
            // Aquí manejamos la navegación si el usuario toca la notificación
            const data = response.notification.request.content.data;
            // TODO: Handle deeper navigation based on data
        });

        return () => {
            notificationListener.current && notificationListener.current.remove();
            responseListener.current && responseListener.current.remove();
        };
    }, []);

    // Re-registrar al cambiar auth state (Listener de supabase)
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session && expoPushToken) {
                console.log("👤 Signed In - Registering Push Token");
                await registerDeviceToken(expoPushToken, Platform.OS);
            }
        });
        return () => {
            authListener.subscription.unsubscribe();
        }
    }, [expoPushToken]);

    return (
        <NotificationContext.Provider value={{ expoPushToken, notification }}>
            {children}
        </NotificationContext.Provider>
    );
}

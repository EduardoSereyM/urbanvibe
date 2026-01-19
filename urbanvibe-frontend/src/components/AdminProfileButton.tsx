import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';

export function AdminProfileButton() {
    const router = useRouter();

    const handlePress = () => {
        Alert.alert(
            'Sesión',
            '¿Qué deseas hacer?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await supabase.auth.signOut();
                            if (router.canDismiss()) {
                                router.dismissAll();
                            }
                            router.replace('/');
                        } catch (error) {
                            console.error('Error al cerrar sesión:', error);
                            Alert.alert('Error', 'No se pudo cerrar sesión');
                        }
                    },
                },
            ]
        );
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            className="w-10 h-10 rounded-full bg-surface-active items-center justify-center border border-surface-active"
        >
            <Ionicons name="person" size={20} color="#FA4E35" />
        </TouchableOpacity>
    );
}

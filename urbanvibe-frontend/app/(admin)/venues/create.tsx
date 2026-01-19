import { useRouter } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../src/lib/supabase';
import { VenueForm } from '../../../src/components/admin/VenueForm';

export default function CreateVenueScreen() {
    const router = useRouter();

    const handleSubmit = async (payload: any) => {
        try {
            const { error } = await supabase
                .from('venues')
                .insert([payload]);

            if (error) throw error;

            Alert.alert('Éxito', 'Local creado correctamente', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Submission error:', error);
            Alert.alert('Error', error.message || 'No se pudo crear el local');
        }
    };

    return (
        <VenueForm
            mode="create"
            onCancel={() => router.back()}
            onSubmit={handleSubmit}
        />
    );
}

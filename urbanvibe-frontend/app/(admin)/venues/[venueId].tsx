import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminVenueDetailById, useUpdateAdminVenue } from '../../../src/hooks/useAdminVenues';
import { VenueForm } from '../../../src/components/admin/VenueForm';

export default function AdminVenueDetailScreen() {
    const { venueId } = useLocalSearchParams<{ venueId: string }>();
    const router = useRouter();
    const { data: venue, isLoading, error } = useAdminVenueDetailById(venueId!);
    const updateMutation = useUpdateAdminVenue();

    const [isEditing, setIsEditing] = useState(false);

    const handleSave = async (payload: any) => {
        if (!venueId) return;

        try {
            await updateMutation.mutateAsync({ venueId, payload });
            setIsEditing(false);
            Alert.alert('Éxito', 'Local actualizado correctamente');
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'No se pudo actualizar el local');
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#FA4E35" />
                <Text className="text-foreground-muted mt-4">Cargando detalle...</Text>
            </SafeAreaView>
        );
    }

    if (error || !venue) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
                <Text className="text-error text-xl font-brand mb-4">Error al cargar local</Text>
                <Text className="text-foreground-muted text-center mb-6">
                    {error instanceof Error ? error.message : 'Local no encontrado'}
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-primary px-6 py-3 rounded-full"
                >
                    <Text className="text-primary-foreground font-brand">Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <VenueForm
                mode={isEditing ? 'edit' : 'view'}
                initialData={venue}
                onCancel={() => {
                    if (isEditing) setIsEditing(false);
                    else router.back();
                }}
                onEdit={() => setIsEditing(true)}
                onSubmit={handleSave}
                loading={updateMutation.isPending}
            />
            {/* <Text>Venue Form Placeholder</Text> */}
        </View>
    );
}

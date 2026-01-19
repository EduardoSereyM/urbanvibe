import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, View, ActivityIndicator, Text } from 'react-native';
import { VenueForm } from '../../../../../src/components/admin/VenueForm';
import { useAdminVenueDetail, useUpdateVenue } from '../../../../../src/hooks/useAdminVenues';

export default function EditVenueScreen() {
    const router = useRouter();
    const { venueId } = useLocalSearchParams<{ venueId: string }>();
    const { data: venue, isLoading } = useAdminVenueDetail(venueId);
    const updateMutation = useUpdateVenue();

    const handleFormSubmit = async (formData: any) => {
        if (!venueId) return;

        try {
            // Transform VenueForm flat data to VenueUpdate schema
            // Similar to create.tsx but for update
            const payload = {
                name: formData.name,
                // legal_name: formData.legal_name, // Locked for owners
                slogan: formData.slogan,
                overview: formData.overview,
                category_id: formData.category_id,

                // Location (Root level lat/lng required by VenueUpdate schema)
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),

                // Address Object
                address: {
                    address_display: `${formData.address_street} ${formData.address_number}, ${formData.city}`,
                    city: formData.city,
                    region_state: formData.region_state,
                    country_code: formData.country_code || 'CL',
                },

                // Extra location details
                directions_tip: formData.directions_tip,
                google_place_id: formData.google_place_id,

                // Media
                logo_url: formData.logo_url,
                cover_image_urls: formData.cover_image_urls,
                menu_media_urls: formData.menu_media_urls,

                // Details
                price_tier: parseInt(formData.price_tier) || 1,
                avg_price_min: parseFloat(formData.avg_price_min) || 0,
                avg_price_max: parseFloat(formData.avg_price_max) || 0,
                // currency_code: formData.currency_code, // Locked for owners
                payment_methods: formData.payment_methods,

                // Status & Config
                operational_status: formData.operational_status,
                is_operational: formData.is_operational,
                // is_founder_venue: formData.is_founder_venue, // Locked
                // company_tax_id: formData.company_tax_id, // Locked
                // ownership_proof_url: formData.ownership_proof_url, // Locked

                // JSONB Fields
                opening_hours: formData.opening_hours,

                // Attributes
                connectivity_features: formData.connectivity_features,
                accessibility_features: formData.accessibility_features,
                space_features: formData.space_features,
                comfort_features: formData.comfort_features,
                audience_features: formData.audience_features,
                entertainment_features: formData.entertainment_features,
                dietary_options: formData.dietary_options,
                access_features: formData.access_features,
                security_features: formData.security_features,
                mood_tags: formData.mood_tags,
                occasion_tags: formData.occasion_tags,

                capacity_estimate: formData.capacity_estimate ? parseInt(formData.capacity_estimate) : undefined,
                seated_capacity: formData.seated_capacity ? parseInt(formData.seated_capacity) : undefined,
                standing_allowed: formData.standing_allowed,
                noise_level: formData.noise_level,
            };

            await updateMutation.mutateAsync({ venueId, payload });

            Alert.alert('Éxito', 'Local actualizado correctamente', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Submission error:', error);
            Alert.alert('Error', error.message || 'No se pudo actualizar el local');
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#1B1D37', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#FA4E35" />
                <Text style={{ color: '#F2F1F0', marginTop: 10 }}>Cargando...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#1B1D37' }}>
            <VenueForm
                mode="edit"
                initialData={venue}
                onCancel={() => router.back()}
                onSubmit={handleFormSubmit}
                loading={updateMutation.isPending}
                isOwner={true}
            />
        </View>
    );
}

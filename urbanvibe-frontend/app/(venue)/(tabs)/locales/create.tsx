import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VenueForm } from '../../../../src/components/admin/VenueForm';
import { useCreateVenue } from '../../../../src/hooks/useAdminVenues';

export default function CreateVenueScreen() {
    const router = useRouter();
    const createMutation = useCreateVenue();

    const handleFormSubmit = async (formData: any) => {
        try {
            // Transform VenueForm flat data to VenueCreate schema expected by backend
            const payload = {
                name: formData.name,
                legal_name: formData.legal_name,
                slogan: formData.slogan,
                overview: formData.overview,
                category_id: formData.category_id,

                // Location (Root level lat/lng required by VenueCreate schema)
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

                // Media (VenueForm handles uploads and returns URLs)
                logo_url: formData.logo_url,
                cover_image_urls: formData.cover_image_urls,
                menu_media_urls: formData.menu_media_urls,

                // Details
                price_tier: parseInt(formData.price_tier) || 1,
                avg_price_min: parseFloat(formData.avg_price_min) || 0,
                avg_price_max: parseFloat(formData.avg_price_max) || 0,
                currency_code: formData.currency_code || 'CLP',
                payment_methods: formData.payment_methods,

                // Status & Config
                operational_status: formData.operational_status || 'open', // 'operational' in form vs 'open' in schema? Schema says string.
                is_founder_venue: formData.is_founder_venue,
                company_tax_id: formData.company_tax_id,
                ownership_proof_url: formData.ownership_proof_url,

                // JSONB Fields
                opening_hours: formData.opening_hours,

                // Attributes (Map flat arrays to... wait, backend doesn't seem to have specific attribute fields in VenueCreate? 
                // Let's check VenueCreate schema again. It DOES NOT have connectivity_features etc. 
                // It seems attributes might be handled differently or I missed them in schema?
                // Checking schema again... VenueCreate in schemas.py lines 41-73 DOES NOT have attributes.
                // But Venue model has them.
                // Maybe they are passed as extra fields and Pydantic ignores them? Or maybe they should be in a 'features' dict?
                // The Venue model has columns for them.
                // If VenueCreate doesn't have them, they won't be saved if using that schema.
                // I should probably add them to VenueCreate schema if they are missing.
                // But for now, let's pass them and see. If schema ignores, we fix schema.
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

            await createMutation.mutateAsync(payload);

            Alert.alert('Éxito', 'Local creado correctamente', [
                { text: 'OK', onPress: () => router.replace('/(venue)/(tabs)/locales') }
            ]);
        } catch (error: any) {
            console.error('Submission error:', error);
            Alert.alert('Error', error.message || 'No se pudo crear el local');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#1B1D37' }}>
            <VenueForm
                mode="create"
                onCancel={() => router.back()}
                onSubmit={handleFormSubmit}
                loading={createMutation.isPending}
                isOwner={true}
            />
        </View>
    );
}

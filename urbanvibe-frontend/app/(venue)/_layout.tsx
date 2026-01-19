import { Stack } from 'expo-router';
import React from 'react';
import { VenueProvider } from '../../src/context/VenueContext';

export default function VenueLayout() {
    return (
        <VenueProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="[venueId]" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="team" options={{ title: 'Equipo' }} />
                <Stack.Screen name="venue-profile" options={{ headerShown: false }} />
            </Stack>
        </VenueProvider>
    );
}

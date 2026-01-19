import { Stack } from 'expo-router';
import React from 'react';

export default function UserLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#1B1D37' },
            }}
        >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="venue/[venueId]" />
            <Stack.Screen name="filters/index" options={{ presentation: 'modal' }} />
            <Stack.Screen name="onboarding/welcome" />
            <Stack.Screen name="onboarding/tips" />
            <Stack.Screen name="modals/checkin-success" options={{ presentation: 'transparentModal' }} />
            <Stack.Screen name="modals/soft-cta-auth" options={{ presentation: 'transparentModal' }} />
        </Stack>
    );
}

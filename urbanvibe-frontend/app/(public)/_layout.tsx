import { Stack } from 'expo-router';
import React from 'react';

export default function PublicLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#1B1D37' },
            }}
        >
            <Stack.Screen name="about" />
            <Stack.Screen name="invite-gate" />
            <Stack.Screen name="public-map" />
        </Stack>
    );
}

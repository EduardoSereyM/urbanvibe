import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#1B1D37' },
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="venues/list" />
            <Stack.Screen name="venues/create" />
            <Stack.Screen name="venues/[venueId]" />
            <Stack.Screen name="users/index" />
            <Stack.Screen name="users/[userId]" />
            <Stack.Screen name="gamification/index" />
            <Stack.Screen name="gamification/levels" />
            <Stack.Screen name="gamification/badges" />
            <Stack.Screen name="gamification/challenges" />

        </Stack>
    );
}

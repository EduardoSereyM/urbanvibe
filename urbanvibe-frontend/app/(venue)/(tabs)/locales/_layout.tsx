import { Stack } from 'expo-router';

export default function LocalesStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="[venueId]" />
            <Stack.Screen name="create" />
        </Stack>
    );
}

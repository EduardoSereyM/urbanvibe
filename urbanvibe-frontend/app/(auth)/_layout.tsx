import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
    React.useEffect(() => {
        console.log('🛡️ AuthLayout MOUNTED');
        return () => console.log('🛡️ AuthLayout UNMOUNTED');
    }, []);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#1B1D37' },
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="register-user" />
            <Stack.Screen name="register-venue" />
            <Stack.Screen name="auth-gate" />
            <Stack.Screen name="invite-request" />
            <Stack.Screen name="verify-invite" />
            <Stack.Screen name="callback" />
        </Stack>
    );
}

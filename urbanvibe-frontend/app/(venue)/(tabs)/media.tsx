import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MediaScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-foreground font-brand text-xl">Fotos y Menús</Text>
            <Text className="text-foreground-muted font-body mt-2">Próximamente</Text>
        </SafeAreaView>
    );
}

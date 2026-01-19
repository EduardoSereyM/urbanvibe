// Explicación del flujo de check-in con QR.
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HowCheckinWorksScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-foreground font-brand text-xl">Cómo funciona el Check-in</Text>
            <Text className="text-foreground-muted font-body mt-2">Guía rápida para tu staff</Text>
        </SafeAreaView>
    );
}

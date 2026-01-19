// Mapa de descubrimiento sin login (solo lectura, sin favoritos ni check-in).
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PublicMapScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-foreground font-brand text-xl">Mapa Público</Text>
            <Text className="text-foreground-muted font-body mt-2">Explora sin cuenta (Solo lectura)</Text>
        </SafeAreaView>
    );
}

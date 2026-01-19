// Pantalla informativa “¿Qué es UrbanVibe?”.
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-foreground font-brand text-xl">Acerca de UrbanVibe</Text>
            <Text className="text-foreground-muted font-body mt-2">Descubre la noche.</Text>
        </SafeAreaView>
    );
}

// Pantalla de bienvenida “Local Fundador”.
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VenueWelcomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-foreground font-brand text-xl">Bienvenido Fundador</Text>
            <Text className="text-foreground-muted font-body mt-2">Gestiona tu local con UrbanVibe</Text>
        </SafeAreaView>
    );
}

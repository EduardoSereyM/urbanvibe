// Primera pantalla de onboarding del usuario explorador. Solo se muestra una vez en el primer login.
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserWelcomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-foreground font-brand text-xl">Bienvenido a UrbanVibe</Text>
            <Text className="text-foreground-muted font-body mt-2">Tu pasaporte a la noche.</Text>
        </SafeAreaView>
    );
}

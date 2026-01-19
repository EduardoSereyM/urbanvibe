// Componente sin UI: decide ruta final según `role` del usuario (user → / (user)/(tabs)/explore, venue → / (venue)/(tabs)/dashboard).
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthGateScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-foreground font-brand text-xl">Auth Gate</Text>
            <Text className="text-foreground-muted font-body mt-2">Redirigiendo según rol...</Text>
        </SafeAreaView>
    );
}

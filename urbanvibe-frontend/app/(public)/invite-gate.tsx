// Pantalla central de Beta Privada: gestiona “Tengo código” y “Solicitar invitación”.
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InviteGateScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-foreground font-brand text-xl">Beta Privada</Text>
            <Text className="text-foreground-muted font-body mt-2">¿Tienes código o quieres solicitar uno?</Text>
        </SafeAreaView>
    );
}

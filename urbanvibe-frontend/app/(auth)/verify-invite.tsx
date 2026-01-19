// Pantalla para ingresar código de invitación.
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyInviteScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-foreground font-brand text-xl">Verificar Código</Text>
            <Text className="text-foreground-muted font-body mt-2">Ingresa tu código de acceso</Text>
        </SafeAreaView>
    );
}

// Soft CTA para acciones que requieren registro (favoritos, ver menú, check-in).
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SoftCtaAuthModal() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-foreground font-brand text-xl">Regístrate para continuar</Text>
            <Text className="text-foreground-muted font-body mt-2">Desbloquea todas las funciones</Text>
        </SafeAreaView>
    );
}

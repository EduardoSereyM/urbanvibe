// Segunda pantalla con tips rápidos de uso. Puede omitirse si no se necesita.
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserTipsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-foreground font-brand text-xl">Tips Rápidos</Text>
            <Text className="text-foreground-muted font-body mt-2">Cómo sacar el máximo provecho.</Text>
        </SafeAreaView>
    );
}

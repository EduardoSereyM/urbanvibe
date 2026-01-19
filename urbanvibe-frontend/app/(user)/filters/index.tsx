// UI de filtros jerárquicos (5 familias de tags).
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FiltersScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-foreground font-brand text-xl">Filtros</Text>
            <Text className="text-foreground-muted font-body mt-2">Música, Vibe, Precio, etc.</Text>
        </SafeAreaView>
    );
}

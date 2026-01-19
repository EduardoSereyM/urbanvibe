import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
            <Text className="text-3xl font-brand text-foreground">Tu Perfil</Text>
            <Text className="mt-2 text-sm font-body text-foreground-muted text-center">
                Próximamente podrás ver tus puntos, check-ins y favoritos.
            </Text>

            {/* Fake CTA to make it look alive */}
            <View className="mt-8 w-full bg-surface p-4 rounded-xl items-center border border-foreground/10 opacity-50">
                <Text className="text-foreground-muted font-body text-xs uppercase tracking-widest">
                    Nivel Explorador
                </Text>
                <Text className="text-accent-cyber font-brand text-2xl mt-1">
                    0 Puntos
                </Text>
            </View>
        </SafeAreaView>
    );
}

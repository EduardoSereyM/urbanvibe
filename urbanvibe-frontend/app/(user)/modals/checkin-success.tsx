// Modal/toast de confirmación de check-in (+10 puntos).
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CheckinSuccessModal() {
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-success font-brand text-xl">¡Check-in Exitoso!</Text>
            <Text className="text-foreground font-body mt-2">+10 Puntos</Text>
        </SafeAreaView>
    );
}

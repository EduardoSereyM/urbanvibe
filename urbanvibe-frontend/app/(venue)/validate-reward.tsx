import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVenueContext } from '../../src/context/VenueContext';
import { useValidateReward } from '../../src/hooks/usePromotions';

export default function ValidateRewardScreen() {
    const router = useRouter();
    const { currentVenueId } = useVenueContext();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    const validateMutation = useValidateReward();

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getBarCodeScannerPermissions();
    }, []);

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        setScanned(true);

        try {
            const result = await validateMutation.mutateAsync({
                venueId: currentVenueId || '',
                qrContent: data
            });

            if (result.success) {
                Alert.alert(
                    '¡Recompensa Validada!',
                    `${result.message}\n\nHas ganado ${result.points_earned || 0} puntos UV.`,
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                Alert.alert(
                    'Error',
                    result.message,
                    [{ text: 'Intentar de nuevo', onPress: () => setScanned(false) }]
                );
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'No se pudo validar el código. Intenta nuevamente.',
                [{ text: 'OK', onPress: () => setScanned(false) }]
            );
        }
    };

    if (hasPermission === null) {
        return <View className="flex-1 bg-black items-center justify-center"><Text className="text-white">Solicitando permiso de cámara...</Text></View>;
    }
    if (hasPermission === false) {
        return <View className="flex-1 bg-black items-center justify-center"><Text className="text-white">Sin acceso a la cámara</Text></View>;
    }

    return (
        <View className="flex-1 bg-black">
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView className="flex-1 justify-between p-6">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-black/50 p-3 rounded-full self-start"
                >
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>

                <View className="bg-black/70 p-6 rounded-2xl items-center">
                    {validateMutation.isPending ? (
                        <View className="items-center">
                            <ActivityIndicator size="large" color="#00E0FF" />
                            <Text className="text-white font-brand-bold mt-4 text-lg">Validando...</Text>
                        </View>
                    ) : (
                        <>
                            <Ionicons name="scan-outline" size={48} color="#00E0FF" />
                            <Text className="text-white font-brand-bold text-xl mt-4 text-center">
                                Escanea el QR del Cliente
                            </Text>
                            <Text className="text-white/70 font-body text-center mt-2">
                                Apunta la cámara al código QR de la recompensa para validarla.
                            </Text>
                        </>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

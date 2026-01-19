import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCheckin } from '../hooks/useCheckin';

interface QRScannerModalProps {
    visible: boolean;
    onClose: () => void;
    onCheckinSuccess?: () => void;
}

export default function QRScannerModal({ visible, onClose, onCheckinSuccess }: QRScannerModalProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
    const { mutate: checkin, isPending } = useCheckin();
    const [scanned, setScanned] = useState(false);

    if (!permission || !locationPermission) {
        // Permissions are still loading.
        return <View />;
    }

    if (!permission.granted || !locationPermission.granted) {
        return (
            <Modal visible={visible} animationType="slide" transparent>
                <View className="flex-1 bg-background justify-center items-center px-6">
                    <Text className="text-foreground font-brand text-xl text-center mb-4">
                        Necesitamos acceso a tu cámara y ubicación
                    </Text>
                    <Text className="text-foreground-muted font-body text-center mb-6">
                        Para poder escanear los códigos QR y verificar que estás en el local.
                    </Text>
                    <TouchableOpacity
                        onPress={async () => {
                            if (!permission.granted) await requestPermission();
                            if (!locationPermission.granted) await requestLocationPermission();
                        }}
                        className="bg-primary px-6 py-3 rounded-full mb-4"
                    >
                        <Text className="text-primary-foreground font-body-bold">Dar Permisos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose}>
                        <Text className="text-foreground font-body">Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned || isPending) return;

        setScanned(true);

        try {
            // Obtener ubicación actual para validar el check-in
            const location = await Location.getCurrentPositionAsync({});

            checkin(
                {
                    token_id: data,
                    user_lat: location.coords.latitude,
                    user_lng: location.coords.longitude
                },
                {
                    onSuccess: () => {
                        if (onCheckinSuccess) onCheckinSuccess();
                        setTimeout(() => {
                            setScanned(false);
                            onClose();
                        }, 1500);
                    },
                    onError: () => {
                        setTimeout(() => setScanned(false), 2000); // Allow retry after delay
                    }
                }
            );
        } catch (error) {
            console.log('Error getting location:', error);
            Alert.alert('Error', 'No pudimos obtener tu ubicación. Asegúrate de tener el GPS activado.');
            setScanned(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
            <View style={styles.container}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                />

                <SafeAreaView className="flex-1 justify-between">
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-4 pt-2">
                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-black/50 p-2 rounded-full"
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white font-brand text-lg shadow-md">Escanear QR</Text>
                        <View className="w-10" />
                    </View>

                    {/* Overlay / Frame */}
                    <View className="items-center justify-center flex-1">
                        <View className="w-64 h-64 border-2 border-primary rounded-3xl bg-transparent items-center justify-center">
                            {isPending && (
                                <Text className="text-white font-body-bold bg-black/50 px-4 py-2 rounded-full">
                                    Verificando...
                                </Text>
                            )}
                        </View>
                        <Text className="text-white/80 font-body text-center mt-8 px-8">
                            Apunta la cámara al código QR del local para hacer check-in
                        </Text>
                    </View>

                    <View className="h-20" />
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
});

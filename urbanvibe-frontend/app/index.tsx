import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Assets
const VIDEO_SOURCE = require('../assets/video/urbanvibe-landing.mp4');
const LOGO_SOURCE = require('../assets/images/urbanvibe-logo.png');

export default function WelcomeScreen() {
    const router = useRouter();

    const goToLogin = () => {
        router.push('/(auth)/login?type=user');
    };



    const goToBeta = () => {
        router.push('/(public)/invite-gate');
    };

    const goToVenueOwner = () => {
        // Always send to login - B2B users will authenticate there
        router.push('/(auth)/login?type=business');
    };

    // Player de video
    const player = useVideoPlayer(VIDEO_SOURCE, (player) => {
        player.loop = true;
        player.play();
        player.muted = true;
    });

    return (
        <View className="flex-1 bg-background">
            {/* Capa 1: Video de fondo */}
            <VideoView
                player={player}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                nativeControls={false}
            />

            {/* Capa 2: Blur oscuro */}
            <BlurView
                tint="dark"
                intensity={10}
                style={StyleSheet.absoluteFill}
            />

            {/* Capa 3: Contenido */}
            <SafeAreaView className="flex-1">
                <View className="flex-1 items-center justify-center px-8">

                    {/* LOGO */}
                    <Image
                        source={LOGO_SOURCE}
                        className="w-[200px] h-[200px] my-2"
                        resizeMode="contain"
                    />

                    {/* Marca */}
                    <View className="flex-row items-end mt-2">
                        <Text className="text-[50px] font-brand text-foreground">urban</Text>
                        <Text className="text-[50px] font-brand text-primary ml-1">Vibe</Text>
                    </View>
                    <View className="bg-sky-300/100 px-3 py-1 rounded-full mt-2 border border-white/30">
                        <Text className="text-black text-xs font-bold tracking-widest uppercase">Version Beta v1.2</Text>
                    </View>

                    {/* Botón principal */}
                    <TouchableOpacity
                        className="w-[90%] bg-primary py-4 mt-4 rounded-full items-center shadow-lg active:opacity-70"
                        onPress={goToLogin}>
                        <Text className="text-foreground text-[0.875rem] font-body-bold text-center" style={{ includeFontPadding: false }}>
                            Desbloquea tu próxima aventura
                        </Text>
                    </TouchableOpacity>

                    {/* B2B Link - Soy Local */}
                    <TouchableOpacity onPress={goToVenueOwner} className="mt-16">
                        <Text className="text-accent-cyber text-sm font-body-bold">
                            🏪 Business Access
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View className="items-center pb-4">
                    <Text className="text-foreground-muted text-xs font-body">
                        urban
                        <Text className="text-primary font-body-bold">Vibe</Text> ® Chile - 2025
                    </Text>
                </View>
            </SafeAreaView >
        </View >
    );
}

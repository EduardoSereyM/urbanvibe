import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';
import { useProfileContext } from '../../../src/hooks/useProfileContext';

const { width } = Dimensions.get('window');

export default function CommunityScreen() {
    const router = useRouter();
    const { data } = useProfileContext();
    const referralCode = data?.referral_code;

    const handleCopyCode = () => {
        const { Clipboard } = require('react-native');
        Clipboard.setString(referralCode || '');
        Alert.alert('¡Copiado!', 'Tu código de invitación está listo para compartir.');
    };

    return (
        <SafeAreaView className="flex-1 bg-background pt-10">
            <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-surface-active">
                    <Ionicons name="arrow-back" size={24} color="#F2F1F0" />
                </TouchableOpacity>
                <Text className="font-brand text-2xl text-foreground">Comunidad</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* 1. SECCIÓN: INVITA AMIGOS */}
                <View className="mt-6 bg-primary/10 p-6 rounded-3xl border border-primary/20 items-center">
                    <View className="bg-primary/20 p-4 rounded-full mb-4">
                        <Ionicons name="gift" size={40} color="#FA4E35" />
                    </View>
                    <Text className="font-brand text-2xl text-primary text-center">¡Expande tu comunidad UrbanVibe!</Text>
                    <Text className="text-foreground-muted text-center mt-2 mb-6">
                        Por cada amigo que use tu código al unirse a UrbanVibe, ambos ganan puntos exclusivos.
                    </Text>

                    <View className="bg-surface-active w-full flex-row justify-between items-center p-4 rounded-2xl border border-white/5">
                        <View>
                            <Text className="text-[10px] text-foreground-muted uppercase font-bold">Tu Código</Text>
                            <Text className="font-brand text-2xl text-foreground">{referralCode || 'URBAN-VIBE'}</Text>
                        </View>
                        <TouchableOpacity onPress={handleCopyCode} className="bg-primary px-5 py-3 rounded-xl">
                            <Text className="text-white font-bold">Copiar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. SECCIÓN: AMIGOS (PRÓXIMAMENTE V13) */}
                <View className="mt-10">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="font-brand text-xl text-foreground">Mis Amigos</Text>
                        <TouchableOpacity className="bg-surface-active px-3 py-1.5 rounded-full border border-white/5">
                            <Text className="text-primary text-xs font-bold">+ Agregar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Placeholder para lista de amigos */}
                    <View className="items-center py-10 opacity-40 bg-surface rounded-3xl border border-surface-active border-dashed">
                        <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
                        <Text className="text-foreground-muted mt-4 font-body text-center px-10">
                            Aquí aparecerán tus amigos para enviarles invitaciones y mensajes.
                        </Text>
                    </View>
                </View>

                {/* 3. SECCIÓN: RETOS GRUPALES */}
                <View className="mt-10 mb-20">
                    <Text className="font-brand text-xl text-foreground mb-4">Retos Grupales</Text>
                    <View className="bg-surface p-5 rounded-3xl border border-surface-active">
                        <View className="flex-row items-center gap-3 mb-3">
                            <Ionicons name="trophy" size={24} color="#F59E0B" />
                            <Text className="text-foreground font-brand text-lg">Próximamente</Text>
                        </View>
                        <Text className="text-foreground-muted text-sm leading-relaxed">
                            Podrás crear retos con tus amigos. Por ejemplo: "Los 3 que visiten más bares este fin de semana ganan 2000 pts".
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

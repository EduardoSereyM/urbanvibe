
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminGamificationService, Challenge } from '../../../src/api/AdminGamificationService';

export default function ChallengesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [code, setCode] = useState('');
    const [title, setTitle] = useState('');
    const [type, setType] = useState('checkin_count');
    const [targetValue, setTargetValue] = useState('1');
    const [rewardPoints, setRewardPoints] = useState('');

    const fetchChallenges = async () => {
        try {
            setLoading(true);
            const data = await AdminGamificationService.getChallenges();
            setChallenges(data);
        } catch (error) {
            console.error("Error fetching challenges:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, []);

    const handleSave = async () => {
        try {
            const challengeData = {
                code,
                title,
                challenge_type: type,
                target_value: parseInt(targetValue),
                reward_points: parseInt(rewardPoints || '0'),
                is_active: true
            };

            await AdminGamificationService.createChallenge(challengeData);

            setModalVisible(false);
            resetForm();
            fetchChallenges();
        } catch (error) {
            console.error("Error saving challenge:", error);
            alert("Error al crear reto. Verifica el código único.");
        }
    };

    const resetForm = () => {
        setCode('');
        setTitle('');
        setType('checkin_count');
        setTargetValue('1');
        setRewardPoints('');
    };

    return (
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="px-6 py-4 border-b border-border flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Text className="text-2xl text-foreground">←</Text>
                    </TouchableOpacity>
                    <View>
                        <Text className="font-heading text-xl text-foreground">Retos</Text>
                        <Text className="text-sm text-foreground-muted">Desafíos Activos</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => { resetForm(); setModalVisible(true); }}
                    className="bg-primary px-4 py-2 rounded-lg"
                >
                    <Text className="text-primary-foreground font-bold">+ Crear</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#00E5FF" />
                </View>
            ) : (
                <FlatList
                    data={challenges}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 24 }}
                    renderItem={({ item }) => (
                        <View className="bg-surface p-4 rounded-xl mb-4 border border-border">
                            <View className="flex-row justify-between mb-2">
                                <View className="bg-accent-cyber/20 px-2 py-1 rounded self-start">
                                    <Text className="text-accent-cyber font-bold text-xs">{item.code}</Text>
                                </View>
                                {item.is_active ?
                                    <Text className="text-success text-xs">Activo</Text> :
                                    <Text className="text-foreground-muted text-xs">Inactivo</Text>
                                }
                            </View>

                            <Text className="text-lg font-bold text-foreground mb-1">{item.title}</Text>
                            <Text className="text-sm text-foreground-muted mb-2">
                                Tipo: {item.challenge_type} | Meta: {item.target_value}
                            </Text>

                            <View className="flex-row items-center mt-2 border-t border-border pt-2">
                                <Text className="mr-2">🎁</Text>
                                <Text className="text-primary font-bold">{item.reward_points} XP</Text>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Modal Form */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end">
                    <TouchableOpacity
                        className="absolute inset-0 bg-black/50"
                        onPress={() => setModalVisible(false)}
                    />
                    <View className="bg-surface p-6 rounded-t-3xl border-t border-border h-[85%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-foreground">Nuevo Reto</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className="text-foreground text-lg">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Código Único (Slug)</Text>
                                <TextInput
                                    className="bg-background p-3 rounded-lg text-foreground border border-border"
                                    placeholder="Ej: first-checkin"
                                    placeholderTextColor="#666"
                                    value={code}
                                    onChangeText={setCode}
                                    autoCapitalize="none"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Título</Text>
                                <TextInput
                                    className="bg-background p-3 rounded-lg text-foreground border border-border"
                                    placeholder="Ej: Primera Visita"
                                    placeholderTextColor="#666"
                                    value={title}
                                    onChangeText={setTitle}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Tipo de Reto</Text>
                                <View className="flex-row flex-wrap">
                                    {['checkin_count', 'venue_count', 'social_invite'].map(t => (
                                        <TouchableOpacity
                                            key={t}
                                            onPress={() => setType(t)}
                                            className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${type === t ? 'bg-primary border-primary' : 'bg-transparent border-border'}`}
                                        >
                                            <Text className={type === t ? 'text-primary-foreground font-bold' : 'text-foreground-muted'}>{t}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="flex-row space-x-4 mb-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-foreground mb-2">Meta (Cantidad)</Text>
                                    <TextInput
                                        className="bg-background p-3 rounded-lg text-foreground border border-border"
                                        placeholder="1"
                                        placeholderTextColor="#666"
                                        keyboardType="numeric"
                                        value={targetValue}
                                        onChangeText={setTargetValue}
                                    />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-foreground mb-2">Premio (XP)</Text>
                                    <TextInput
                                        className="bg-background p-3 rounded-lg text-foreground border border-border"
                                        placeholder="0"
                                        placeholderTextColor="#666"
                                        keyboardType="numeric"
                                        value={rewardPoints}
                                        onChangeText={setRewardPoints}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSave}
                                className="bg-primary p-4 rounded-xl items-center mt-4"
                            >
                                <Text className="text-primary-foreground font-bold text-lg">Crear Reto</Text>
                            </TouchableOpacity>
                            <View className="h-10" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

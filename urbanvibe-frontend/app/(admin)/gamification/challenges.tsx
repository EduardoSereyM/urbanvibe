
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminGamificationService, Badge, Challenge } from '../../../src/api/AdminGamificationService';

export default function ChallengesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
    const [code, setCode] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('CHECKIN_COUNT');
    const [targetValue, setTargetValue] = useState('1');
    const [rewardPoints, setRewardPoints] = useState('');
    const [rewardBadgeId, setRewardBadgeId] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);

    const challengeTypes = [
        { value: 'CHECKIN_COUNT', label: 'Check-ins' },
        { value: 'REVIEW_COUNT', label: 'Reseñas' },
        { value: 'REFERRAL_COUNT', label: 'Referidos' },
        { value: 'VENUE_COUNT', label: 'Locales Visitados' },
    ];

    const fetchData = async () => {
        try {
            setLoading(true);
            const [challengesData, badgesData] = await Promise.all([
                AdminGamificationService.getChallenges(),
                AdminGamificationService.getBadges()
            ]);
            setChallenges(challengesData);
            setBadges(badgesData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async () => {
        try {
            const challengeData: any = {
                code,
                title,
                description,
                challenge_type: type,
                target_value: parseInt(targetValue),
                reward_points: parseInt(rewardPoints || '0'),
                is_active: isActive
            };

            if (rewardBadgeId) {
                challengeData.reward_badge_id = rewardBadgeId;
            }

            if (editingChallenge) {
                await AdminGamificationService.updateChallenge(editingChallenge.id, challengeData);
            } else {
                await AdminGamificationService.createChallenge(challengeData);
            }

            setModalVisible(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error("Error saving challenge:", error);
            alert("Error al guardar reto. Verifica el código único.");
        }
    };

    const handleDelete = async (challenge: Challenge) => {
        Alert.alert(
            "Eliminar Reto",
            `¿Estás seguro de eliminar "${challenge.title}"? Esto puede afectar el progreso de usuarios.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AdminGamificationService.deleteChallenge(challenge.id);
                            fetchData();
                        } catch (error) {
                            console.error("Error deleting challenge:", error);
                            alert("Error al eliminar reto");
                        }
                    }
                }
            ]
        );
    };

    const toggleActive = async (challenge: Challenge) => {
        try {
            await AdminGamificationService.updateChallenge(challenge.id, {
                is_active: !challenge.is_active
            });
            fetchData();
        } catch (error) {
            console.error("Error toggling challenge:", error);
        }
    };

    const openEdit = (challenge: Challenge) => {
        setEditingChallenge(challenge);
        setCode(challenge.code);
        setTitle(challenge.title);
        setDescription(challenge.description || '');
        setType(challenge.challenge_type);
        setTargetValue(challenge.target_value.toString());
        setRewardPoints(challenge.reward_points.toString());
        setRewardBadgeId(challenge.reward_badge_id || null);
        setIsActive(challenge.is_active);
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingChallenge(null);
        setCode('');
        setTitle('');
        setDescription('');
        setType('CHECKIN_COUNT');
        setTargetValue('1');
        setRewardPoints('');
        setRewardBadgeId(null);
        setIsActive(true);
    };

    const getBadgeName = (badgeId?: string) => {
        if (!badgeId) return null;
        const badge = badges.find(b => b.id === badgeId);
        return badge?.name || 'Insignia';
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
                                <TouchableOpacity onPress={() => toggleActive(item)}>
                                    {item.is_active ?
                                        <Text className="text-success text-xs font-bold">✓ Activo</Text> :
                                        <Text className="text-foreground-muted text-xs">Inactivo</Text>
                                    }
                                </TouchableOpacity>
                            </View>

                            <Text className="text-lg font-bold text-foreground mb-1">{item.title}</Text>
                            <Text className="text-sm text-foreground-muted mb-2">
                                Tipo: {item.challenge_type} | Meta: {item.target_value}
                            </Text>

                            <View className="flex-row items-center mt-2 border-t border-border pt-2">
                                <Text className="mr-2">🎁</Text>
                                <Text className="text-primary font-bold">{item.reward_points} XP</Text>
                                {item.reward_badge_id && (
                                    <View className="ml-2 bg-purple-500/20 px-2 py-1 rounded-lg border border-purple-500/30 flex-row items-center">
                                        <View className="w-5 h-5 rounded-full bg-[#1B1D37] items-center justify-center mr-1 overflow-hidden">
                                            {badges.find(b => b.id === item.reward_badge_id)?.icon_url?.startsWith('http') ? (
                                                <Image source={{ uri: badges.find(b => b.id === item.reward_badge_id)?.icon_url }} className="w-4 h-4" resizeMode="contain" />
                                            ) : (
                                                <Text className="text-[10px]">{badges.find(b => b.id === item.reward_badge_id)?.icon_url || '🏅'}</Text>
                                            )}
                                        </View>
                                        <Text className="text-purple-400 text-xs font-bold">{getBadgeName(item.reward_badge_id)}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Action Buttons */}
                            <View className="flex-row mt-3 justify-end">
                                <TouchableOpacity onPress={() => openEdit(item)} className="mr-3">
                                    <Text className="text-accent-cyber">Editar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item)}>
                                    <Text className="text-destructive">Eliminar</Text>
                                </TouchableOpacity>
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
                    <View className="bg-surface p-6 rounded-t-3xl border-t border-border h-[90%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-foreground">
                                {editingChallenge ? 'Editar Reto' : 'Nuevo Reto'}
                            </Text>
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
                                    editable={!editingChallenge}
                                />
                                {editingChallenge && (
                                    <Text className="text-xs text-foreground-muted mt-1">El código no se puede modificar</Text>
                                )}
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
                                <Text className="text-foreground mb-2">Descripción</Text>
                                <TextInput
                                    className="bg-background p-3 rounded-lg text-foreground border border-border h-20"
                                    placeholder="Ej: Haz tu primer check-in en un local"
                                    placeholderTextColor="#666"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Tipo de Reto</Text>
                                <View className="flex-row flex-wrap">
                                    {challengeTypes.map(t => (
                                        <TouchableOpacity
                                            key={t.value}
                                            onPress={() => setType(t.value)}
                                            className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${type === t.value ? 'bg-primary border-primary' : 'bg-transparent border-border'}`}
                                        >
                                            <Text className={type === t.value ? 'text-primary-foreground font-bold' : 'text-foreground-muted'}>{t.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="flex-row mb-4">
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

                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Insignia Premio (Opcional)</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <TouchableOpacity
                                        onPress={() => setRewardBadgeId(null)}
                                        className={`mr-2 px-4 py-2 rounded-lg border ${!rewardBadgeId ? 'bg-primary border-primary' : 'bg-transparent border-border'}`}
                                    >
                                        <Text className={!rewardBadgeId ? 'text-primary-foreground font-bold' : 'text-foreground-muted'}>Ninguna</Text>
                                    </TouchableOpacity>
                                    {badges.map(badge => (
                                        <TouchableOpacity
                                            key={badge.id}
                                            onPress={() => setRewardBadgeId(badge.id)}
                                            className={`mr-3 px-3 py-2 rounded-xl border flex-row items-center ${rewardBadgeId === badge.id ? 'bg-purple-500/30 border-purple-500' : 'bg-[#252A4A] border-white/10'}`}
                                        >
                                            <View className="w-8 h-8 rounded-full bg-[#1B1D37] items-center justify-center mr-2 overflow-hidden border border-white/5">
                                                {badge.icon_url?.startsWith('http') ? (
                                                    <Image source={{ uri: badge.icon_url }} className="w-6 h-6" resizeMode="contain" />
                                                ) : (
                                                    <Text className="text-lg">{badge.icon_url || '🏅'}</Text>
                                                )}
                                            </View>
                                            <View>
                                                <Text className={`text-xs font-bold ${rewardBadgeId === badge.id ? 'text-purple-400' : 'text-foreground'}`}>{badge.name}</Text>
                                                <Text className="text-[9px] text-foreground-muted">{badge.category}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View className="flex-row items-center justify-between mb-6 bg-background p-4 rounded-lg">
                                <Text className="text-foreground">Reto Activo</Text>
                                <Switch
                                    value={isActive}
                                    onValueChange={setIsActive}
                                    trackColor={{ false: '#444', true: '#00E5FF33' }}
                                    thumbColor={isActive ? '#00E5FF' : '#888'}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSave}
                                className="bg-primary p-4 rounded-xl items-center"
                            >
                                <Text className="text-primary-foreground font-bold text-lg">
                                    {editingChallenge ? 'Guardar Cambios' : 'Crear Reto'}
                                </Text>
                            </TouchableOpacity>
                            <View className="h-10" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

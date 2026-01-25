
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminGamificationService, Badge } from '../../../src/api/AdminGamificationService';

export default function BadgesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [category, setCategory] = useState('GENERAL');

    const fetchBadges = async () => {
        try {
            setLoading(true);
            const data = await AdminGamificationService.getBadges();
            setBadges(data);
        } catch (error) {
            console.error("Error fetching badges:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBadges();
    }, []);

    const handleSave = async () => {
        try {
            const badgeData = {
                name,
                description,
                icon_url: iconUrl,
                category
            };

            await AdminGamificationService.createBadge(badgeData);

            setModalVisible(false);
            resetForm();
            fetchBadges();
        } catch (error) {
            console.error("Error saving badge:", error);
            alert("Error al crear insignia");
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setIconUrl('');
        setCategory('GENERAL');
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
                        <Text className="font-heading text-xl text-foreground">Insignias</Text>
                        <Text className="text-sm text-foreground-muted">Catálogo de Medallas</Text>
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
                    data={badges}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 24 }}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <View className="bg-surface p-4 rounded-xl mb-4 border border-border flex-1 mx-2 items-center aspect-square justify-center">
                            <View className="bg-background-elevated w-16 h-16 rounded-full items-center justify-center mb-3">
                                {/* If icon_url is an emoji, show text, if URL, show Image (omitted for simplicity, using Text/Emoji placeholder) */}
                                <Text className="text-3xl">{item.icon_url?.startsWith('http') ? '🏅' : (item.icon_url || '🏅')}</Text>
                            </View>
                            <Text className="text-base font-bold text-foreground text-center mb-1">{item.name}</Text>
                            <Text className="text-xs text-foreground-muted text-center" numberOfLines={2}>{item.description}</Text>
                            <View className="mt-2 bg-primary/10 px-2 py-0.5 rounded">
                                <Text className="text-[10px] text-primary">{item.category}</Text>
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
                    <View className="bg-surface p-6 rounded-t-3xl border-t border-border h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-foreground">Nueva Insignia</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className="text-foreground text-lg">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Nombre</Text>
                                <TextInput
                                    className="bg-background p-3 rounded-lg text-foreground border border-border"
                                    placeholder="Ej: Explorador Nocturno"
                                    placeholderTextColor="#666"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Icono (Emoji o URL)</Text>
                                <TextInput
                                    className="bg-background p-3 rounded-lg text-foreground border border-border"
                                    placeholder="Ej: 🌙"
                                    placeholderTextColor="#666"
                                    value={iconUrl}
                                    onChangeText={setIconUrl}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Categoría</Text>
                                <View className="flex-row flex-wrap">
                                    {['GENERAL', 'EXPLORATION', 'SOCIAL', 'SPECIAL'].map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            onPress={() => setCategory(cat)}
                                            className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${category === cat ? 'bg-primary border-primary' : 'bg-transparent border-border'}`}
                                        >
                                            <Text className={category === cat ? 'text-primary-foreground font-bold' : 'text-foreground-muted'}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="text-foreground mb-2">Descripción</Text>
                                <TextInput
                                    className="bg-background p-3 rounded-lg text-foreground border border-border h-24"
                                    placeholder="Ej: Haz check-in en 3 bares después de las 00:00"
                                    placeholderTextColor="#666"
                                    multiline
                                    textAlignVertical="top"
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSave}
                                className="bg-primary p-4 rounded-xl items-center"
                            >
                                <Text className="text-primary-foreground font-bold text-lg">Crear Insignia</Text>
                            </TouchableOpacity>
                            <View className="h-10" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

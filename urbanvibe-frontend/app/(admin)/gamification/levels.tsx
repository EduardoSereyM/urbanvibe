
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminGamificationService, Level } from '../../../src/api/AdminGamificationService';

export default function LevelsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [editingLevel, setEditingLevel] = useState<Level | null>(null);
    const [name, setName] = useState('');
    const [minPoints, setMinPoints] = useState('');
    const [benefits, setBenefits] = useState('');

    const fetchLevels = async () => {
        try {
            setLoading(true);
            const data = await AdminGamificationService.getLevels();
            setLevels(data);
        } catch (error) {
            console.error("Error fetching levels:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLevels();
    }, []);

    const handleSave = async () => {
        try {
            const levelData = {
                name,
                min_points: parseInt(minPoints),
                benefits: benefits.split(',').map(b => b.trim()).filter(b => b)
            };

            if (editingLevel) {
                await AdminGamificationService.updateLevel(editingLevel.id, levelData);
            } else {
                await AdminGamificationService.createLevel(levelData);
            }

            setModalVisible(false);
            resetForm();
            fetchLevels();
        } catch (error) {
            console.error("Error saving level:", error);
            alert("Error al guardar nivel");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await AdminGamificationService.deleteLevel(id);
            fetchLevels();
        } catch (error) {
            console.error("Error deleting level:", error);
        }
    };

    const openEdit = (level: Level) => {
        setEditingLevel(level);
        setName(level.name);
        setMinPoints(level.min_points.toString());
        setBenefits(level.benefits.join(', '));
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingLevel(null);
        setName('');
        setMinPoints('');
        setBenefits('');
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
                        <Text className="font-heading text-xl text-foreground">Niveles</Text>
                        <Text className="text-sm text-foreground-muted">Gestionar Rangos</Text>
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
                    data={levels}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 24 }}
                    renderItem={({ item }) => (
                        <View className="bg-surface p-4 rounded-xl mb-4 border border-border">
                            <View className="flex-row justify-between items-start mb-2">
                                <View>
                                    <Text className="text-lg font-bold text-foreground">{item.name}</Text>
                                    <Text className="text-primary font-bold">{item.min_points} XP</Text>
                                </View>
                                <View className="flex-row">
                                    <TouchableOpacity onPress={() => openEdit(item)} className="mr-3">
                                        <Text className="text-accent-cyber">Editar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                        <Text className="text-destructive">Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {item.benefits.length > 0 && (
                                <View className="mt-2">
                                    <Text className="text-xs text-foreground-muted mb-1">Beneficios:</Text>
                                    <View className="flex-row flex-wrap">
                                        {item.benefits.map((benefit, idx) => (
                                            <View key={idx} className="bg-background-elevated px-2 py-1 rounded mr-2 mb-1">
                                                <Text className="text-xs text-foreground">{benefit}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
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
                            <Text className="text-xl font-bold text-foreground">
                                {editingLevel ? 'Editar Nivel' : 'Nuevo Nivel'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className="text-foreground text-lg">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Nombre del Nivel</Text>
                                <TextInput
                                    className="bg-background p-3 rounded-lg text-foreground border border-border"
                                    placeholder="Ej: Explorador"
                                    placeholderTextColor="#666"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Puntos Mínimos (XP)</Text>
                                <TextInput
                                    className="bg-background p-3 rounded-lg text-foreground border border-border"
                                    placeholder="Ej: 1000"
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                    value={minPoints}
                                    onChangeText={setMinPoints}
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="text-foreground mb-2">Beneficios (separados por coma)</Text>
                                <TextInput
                                    className="bg-background p-3 rounded-lg text-foreground border border-border h-24"
                                    placeholder="Ej: 5% Descuento, Acceso VIP"
                                    placeholderTextColor="#666"
                                    multiline
                                    textAlignVertical="top"
                                    value={benefits}
                                    onChangeText={setBenefits}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSave}
                                className="bg-primary p-4 rounded-xl items-center"
                            >
                                <Text className="text-primary-foreground font-bold text-lg">Guardar Nivel</Text>
                            </TouchableOpacity>
                            <View className="h-10" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

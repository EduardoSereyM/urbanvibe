
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AdminGamificationService, Badge } from '../../../src/api/AdminGamificationService';

export default function BadgesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
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

            if (editingBadge) {
                await AdminGamificationService.updateBadge(editingBadge.id, badgeData);
            } else {
                await AdminGamificationService.createBadge(badgeData);
            }

            setModalVisible(false);
            resetForm();
            fetchBadges();
        } catch (error) {
            console.error("Error saving badge:", error);
            alert("Error al guardar insignia");
        }
    };

    const handleDelete = async (badge: Badge) => {
        Alert.alert(
            "Eliminar Insignia",
            `¿Estás seguro de eliminar "${badge.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AdminGamificationService.deleteBadge(badge.id);
                            fetchBadges();
                        } catch (error) {
                            console.error("Error deleting badge:", error);
                            alert("Error al eliminar insignia");
                        }
                    }
                }
            ]
        );
    };

    const openEdit = (badge: Badge) => {
        setEditingBadge(badge);
        setName(badge.name);
        setDescription(badge.description || '');
        setIconUrl(badge.icon_url || '');
        setCategory(badge.category);
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingBadge(null);
        setName('');
        setDescription('');
        setIconUrl('');
        setCategory('GENERAL');
    };

    const renderBadgeItem = ({ item }: { item: Badge }) => (
        <TouchableOpacity
            onPress={() => openEdit(item)}
            activeOpacity={0.9}
            className="w-full mb-4"
        >
            {/* Neon Border Gradient (Purple/Magenta) */}
            <LinearGradient
                colors={['#D946EF', '#9333EA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-[1px] rounded-[20px]"
            >
                {/* Card Background */}
                <LinearGradient
                    colors={['#2A3055', '#1F2440']}
                    className="rounded-[19px] p-4 flex-row items-center"
                >
                    {/* Badge Icon Left */}
                    <View className="mr-4 relative">
                        {/* Glow */}
                        <View className="absolute inset-0 bg-purple-500 blur-md opacity-30 rounded-full" />
                        <View className="w-14 h-14 rounded-full bg-[#1B1D37] border border-purple-500/30 items-center justify-center">
                            <Text className="text-2xl">{item.icon_url?.startsWith('http') ? '🏅' : (item.icon_url || '🏅')}</Text>
                        </View>
                    </View>

                    {/* Text Content Center */}
                    <View className="flex-1 pr-2">
                        <View className="flex-row items-center mb-1">
                            <Text className="font-brand-bold text-white text-lg mr-2">
                                {item.name}
                            </Text>
                            {/* Mini Tag */}
                            <View className="bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/20">
                                <Text className="text-[9px] text-purple-300 font-bold uppercase tracking-wider">
                                    {item.category}
                                </Text>
                            </View>
                        </View>

                        <Text className="text-gray-400 font-body text-xs leading-4" numberOfLines={2}>
                            {item.description}
                        </Text>
                    </View>

                    {/* Actions Right (Chevron or Edit) */}
                    <View className="flex-row items-center space-x-2">
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); openEdit(item); }} className="p-2 bg-white/5 rounded-full border border-white/5">
                            <Ionicons name="pencil" size={14} color="#D946EF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDelete(item); }} className="p-2 bg-white/5 rounded-full border border-white/5">
                            <Ionicons name="trash" size={14} color="#EF4444" />
                        </TouchableOpacity>
                    </View>

                </LinearGradient>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#1B1D37]" style={{ paddingTop: insets.top }}>
            {/* Bg Glow */}
            <View className="absolute top-0 right-0 w-full h-64 bg-purple-600/10 blur-3xl opacity-60" />

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between mb-2">
                <View>
                    <TouchableOpacity onPress={() => router.back()} className="mb-4 w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="font-brand-bold text-3xl text-white">
                        Insignias
                    </Text>
                    <Text className="text-gray-400 font-body text-sm">
                        Catálogo Global
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => { resetForm(); setModalVisible(true); }}
                    className="shadow-lg shadow-orange-500/20"
                >
                    <LinearGradient
                        colors={['#F97316', '#EA580C']}
                        className="px-5 py-3 rounded-xl flex-row items-center"
                    >
                        <Ionicons name="add" size={20} color="white" style={{ marginRight: 4 }} />
                        <Text className="text-white font-bold">+ Crear</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#D946EF" />
                </View>
            ) : (
                <FlatList
                    data={badges}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    renderItem={renderBadgeItem}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Modern Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <BlurView intensity={20} tint="dark" className="flex-1 justify-end">
                    <TouchableOpacity
                        className="absolute inset-0 bg-black/60"
                        onPress={() => setModalVisible(false)}
                    />
                    <View className="bg-[#1B1D37] border-t border-white/10 rounded-t-[32px] h-[85%] shadow-2xl">
                        {/* Modal Handle */}
                        <View className="items-center pt-4 pb-2">
                            <View className="w-12 h-1.5 bg-white/20 rounded-full" />
                        </View>

                        <View className="px-6 py-4 border-b border-white/5 flex-row justify-between items-center">
                            <Text className="text-2xl font-brand-bold text-white">
                                {editingBadge ? 'Editar Insignia' : 'Nueva Insignia'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-white/5 rounded-full">
                                <Ionicons name="close" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="p-6">
                            <View className="space-y-6">
                                <View>
                                    <Text className="text-gray-400 mb-2 font-bold text-xs uppercase tracking-wider">Nombre</Text>
                                    <TextInput
                                        className="bg-[#252A4A] p-4 rounded-xl text-white border border-white/10 font-body text-lg"
                                        placeholder="Ej: Explorador Nocturno"
                                        placeholderTextColor="#6B7280"
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>

                                <View>
                                    <Text className="text-gray-400 mb-2 font-bold text-xs uppercase tracking-wider">Icono (Emoji)</Text>
                                    <TextInput
                                        className="bg-[#252A4A] p-4 rounded-xl text-white border border-white/10 font-body text-3xl text-center"
                                        placeholder="🏅"
                                        placeholderTextColor="#6B7280"
                                        value={iconUrl}
                                        onChangeText={setIconUrl}
                                    />
                                </View>

                                <View>
                                    <Text className="text-gray-400 mb-2 font-bold text-xs uppercase tracking-wider">Categoría</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {['GENERAL', 'EXPLORATION', 'SOCIAL', 'SPECIAL'].map(cat => (
                                            <TouchableOpacity
                                                key={cat}
                                                onPress={() => setCategory(cat)}
                                                className={`px-4 py-2 rounded-lg border ${category === cat ? 'bg-purple-600 border-purple-500' : 'bg-[#252A4A] border-white/10'}`}
                                            >
                                                <Text className={`text-xs font-bold ${category === cat ? 'text-white' : 'text-gray-400'}`}>{cat}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-gray-400 mb-2 font-bold text-xs uppercase tracking-wider">Descripción</Text>
                                    <TextInput
                                        className="bg-[#252A4A] p-4 rounded-xl text-white border border-white/10 font-body h-32"
                                        placeholder="Describe cómo obtener esta insignia..."
                                        placeholderTextColor="#6B7280"
                                        multiline
                                        textAlignVertical="top"
                                        value={description}
                                        onChangeText={setDescription}
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={handleSave}
                                    className="mt-4 shadow-lg shadow-purple-500/30"
                                >
                                    <LinearGradient
                                        colors={['#D946EF', '#9333EA']}
                                        className="p-4 rounded-xl items-center"
                                    >
                                        <Text className="text-white font-brand-bold text-lg">
                                            {editingBadge ? 'Guardar Cambios' : 'Crear Insignia'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                            <View className="h-24" />
                        </ScrollView>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}

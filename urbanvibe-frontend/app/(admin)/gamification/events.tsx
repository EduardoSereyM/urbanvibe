
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminGamificationService, GamificationEvent } from '../../../src/api/AdminGamificationService';

const EVENT_DESCRIPTIONS: Record<string, { name: string; icon: string }> = {
    'CHECKIN': { name: 'Check-in en Local', icon: '📍' },
    'REVIEW': { name: 'Escribir Reseña', icon: '⭐' },
    'REFERRAL_USER': { name: 'Referir Amigo', icon: '👥' },
    'REFERRAL_VENUE': { name: 'Referir Local', icon: '🏪' },
    'FIRST_CHECKIN': { name: 'Primer Check-in', icon: '🎉' },
    'VENUE_INVITE': { name: 'Invitar a Local', icon: '✉️' },
    'GROUP_CHECKIN': { name: 'Check-in Grupal', icon: '👨‍👩‍👧‍👦' },
};

export default function EventsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [events, setEvents] = useState<GamificationEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [editingEvent, setEditingEvent] = useState<GamificationEvent | null>(null);
    const [eventCode, setEventCode] = useState('');
    const [targetType, setTargetType] = useState('user');
    const [points, setPoints] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [description, setDescription] = useState('');

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const data = await AdminGamificationService.getEvents();
            setEvents(data);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSave = async () => {
        if (!eventCode && !editingEvent) return;

        try {
            const data = {
                points: parseInt(points || '0'),
                is_active: isActive,
                description,
                target_type: targetType,
                event_code: eventCode
            };

            if (editingEvent) {
                await AdminGamificationService.updateEvent(editingEvent.event_code, data);
            } else {
                await AdminGamificationService.createEvent(data as GamificationEvent);
            }

            setModalVisible(false);
            resetForm();
            fetchEvents();
        } catch (error) {
            console.error("Error saving event:", error);
            alert("Error al guardar regla. Verifica que el código no exista.");
        }
    };

    const toggleActive = async (event: GamificationEvent) => {
        try {
            await AdminGamificationService.updateEvent(event.event_code, {
                is_active: !event.is_active
            });
            fetchEvents();
        } catch (error) {
            console.error("Error toggling event:", error);
        }
    };

    const openEdit = (event: GamificationEvent) => {
        setEditingEvent(event);
        setEventCode(event.event_code);
        setTargetType(event.target_type);
        setPoints(event.points.toString());
        setIsActive(event.is_active);
        setDescription(event.description || '');
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingEvent(null);
        setEventCode('');
        setTargetType('user');
        setPoints('');
        setIsActive(true);
        setDescription('');
    };

    const getEventInfo = (code: string) => {
        return EVENT_DESCRIPTIONS[code] || { name: code, icon: '🎯' };
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
                        <Text className="font-heading text-xl text-foreground">Reglas de Puntos</Text>
                        <Text className="text-sm text-foreground-muted">XP por cada acción</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => { resetForm(); setModalVisible(true); }}
                    className="bg-primary px-4 py-2 rounded-lg"
                >
                    <Text className="text-primary-foreground font-bold">+ Crear</Text>
                </TouchableOpacity>
            </View>

            {/* Info Banner */}
            <View className="mx-6 mt-4 p-4 bg-primary/10 rounded-xl border border-primary/30">
                <Text className="text-primary font-bold mb-1">💡 ¿Cómo funciona?</Text>
                <Text className="text-foreground-muted text-sm">
                    Cada vez que un usuario realiza una acción (check-in, reseña, etc.), recibe los puntos configurados aquí.
                    Puedes activar/desactivar eventos o modificar los puntos.
                </Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#00E5FF" />
                </View>
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={item => item.event_code}
                    contentContainerStyle={{ padding: 24 }}
                    renderItem={({ item }) => {
                        const info = getEventInfo(item.event_code);
                        return (
                            <TouchableOpacity
                                onPress={() => openEdit(item)}
                                className="bg-surface p-4 rounded-xl mb-3 border border-border"
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1">
                                        <View className="bg-background-elevated w-12 h-12 rounded-xl items-center justify-center mr-3">
                                            <Text className="text-2xl">{info.icon}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-base font-bold text-foreground">{info.name}</Text>
                                            <Text className="text-xs text-foreground-muted">{item.event_code}</Text>
                                            {item.description && (
                                                <Text className="text-xs text-foreground-muted mt-1" numberOfLines={1}>{item.description}</Text>
                                            )}
                                        </View>
                                    </View>

                                    <View className="items-end">
                                        <View className="bg-primary/20 px-3 py-1 rounded-lg mb-2">
                                            <Text className="text-primary font-bold text-lg">+{item.points}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => toggleActive(item)}>
                                            <Text className={item.is_active ? "text-success text-xs" : "text-foreground-muted text-xs"}>
                                                {item.is_active ? '✓ Activo' : 'Inactivo'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View className="flex-row items-center mt-3 pt-3 border-t border-border">
                                    <Text className="text-foreground-muted text-xs">Target: </Text>
                                    <View className="bg-background px-2 py-0.5 rounded">
                                        <Text className="text-xs text-foreground">{item.target_type}</Text>
                                    </View>
                                    <View className="flex-1" />
                                    <Text className="text-accent-cyber text-xs">Editar →</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
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
                    <View className="bg-surface p-6 rounded-t-3xl border-t border-border">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-xl font-bold text-foreground">
                                    {editingEvent ? 'Editar Regla' : 'Nueva Regla'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className="text-foreground text-lg">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Código del Evento (Slug)</Text>
                                <TextInput
                                    className="bg-background p-3 rounded-lg text-foreground border border-border"
                                    placeholder="EJ: CHECKIN_NUEVO"
                                    placeholderTextColor="#666"
                                    value={eventCode}
                                    onChangeText={setEventCode}
                                    autoCapitalize="characters"
                                    editable={!editingEvent}
                                />
                                {editingEvent && (
                                    <Text className="text-xs text-foreground-muted mt-1">El código no se puede modificar una vez creado</Text>
                                )}
                            </View>

                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Beneficiario (Target)</Text>
                                <View className="flex-row">
                                    <TouchableOpacity
                                        onPress={() => setTargetType('user')}
                                        className={`flex-1 mr-2 p-3 rounded-lg border items-center ${targetType === 'user' ? 'bg-primary border-primary' : 'bg-background border-border'}`}
                                    >
                                        <Text className={targetType === 'user' ? 'text-primary-foreground font-bold' : 'text-foreground-muted'}>Usuario (Win XP)</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setTargetType('venue')}
                                        className={`flex-1 ml-2 p-3 rounded-lg border items-center ${targetType === 'venue' ? 'bg-primary border-primary' : 'bg-background border-border'}`}
                                    >
                                        <Text className={targetType === 'venue' ? 'text-primary-foreground font-bold' : 'text-foreground-muted'}>Local (Win Stats)</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="bg-background p-4 rounded-xl mb-4 flex-row items-center border border-border/30">
                                <Text className="text-3xl mr-3">{getEventInfo(eventCode).icon}</Text>
                                <View>
                                    <Text className="text-lg font-bold text-foreground">{getEventInfo(eventCode).name}</Text>
                                    <Text className="text-xs text-foreground-muted">Vista previa de regla</Text>
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Puntos Otorgados</Text>
                                <TextInput
                                    className="bg-background p-4 rounded-lg text-foreground border border-border text-center text-2xl font-bold"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                    value={points}
                                    onChangeText={setPoints}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-foreground mb-2">Descripción (Opcional)</Text>
                                <TextInput
                                    className="bg-background p-3 rounded-lg text-foreground border border-border h-20"
                                    placeholder="Describe esta regla..."
                                    placeholderTextColor="#666"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>

                            <View className="flex-row items-center justify-between mb-6 bg-background p-4 rounded-lg">
                                <View>
                                    <Text className="text-foreground font-bold">Regla Activa</Text>
                                    <Text className="text-xs text-foreground-muted">Si está desactivada, no se otorgarán puntos</Text>
                                </View>
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
                                <Text className="text-primary-foreground font-bold text-lg">Guardar Cambios</Text>
                            </TouchableOpacity>
                            <View className="h-10" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

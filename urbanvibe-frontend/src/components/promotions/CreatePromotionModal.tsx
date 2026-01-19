import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCreatePromotion } from '../../hooks/usePromotions';
import { useImageUpload } from '../../hooks/useImageUpload';
import { ImageGalleryEditor } from '../venue/ImageGalleryEditor';

interface CreatePromotionModalProps {
    visible: boolean;
    onClose: () => void;
    venueId: string;
}

export function CreatePromotionModal({ visible, onClose, venueId }: CreatePromotionModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'standard' | 'uv_reward'>('standard');
    const [pointsCost, setPointsCost] = useState('100');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const createMutation = useCreatePromotion();
    const { pickImage, uploadImage, uploading } = useImageUpload();

    const handleImagePick = async () => {
        // User requested to not be forced to crop, so we set allowEditing to false
        const uri = await pickImage([16, 9], false);
        if (uri) {
            try {
                const url = await uploadImage(uri, 'promotions');
                if (url) setImageUrl(url);
            } catch (error) {
                console.error('Image upload error:', error);
                Alert.alert('Error', 'No se pudo subir la imagen');
            }
        }
    };

    const handleSubmit = async () => {
        if (!title || !description) {
            Alert.alert('Error', 'Por favor completa los campos obligatorios');
            return;
        }

        try {
            console.log('Creating promotion with payload:', {
                venueId,
                title,
                description,
                promo_type: type,
                image_url: imageUrl,
                points_cost: type === 'uv_reward' ? parseInt(pointsCost) : undefined,
            });

            await createMutation.mutateAsync({
                venueId,
                payload: {
                    title,
                    description,
                    promo_type: type,
                    image_url: imageUrl || undefined,
                    points_cost: type === 'uv_reward' ? parseInt(pointsCost) : undefined,
                    is_active: true,
                    // Default values for V4
                    is_highlighted: false,
                }
            });
            Alert.alert('Éxito', 'Promoción creada correctamente');
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setImageUrl(null);
        } catch (error: any) {
            console.error('Create promotion error:', error);
            console.error('Error response:', error.response?.data);
            Alert.alert('Error', `No se pudo crear la promoción: ${error.message || 'Error desconocido'}`);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-background">
                <View className="flex-row justify-between items-center p-4 border-b border-surface-active">
                    <Text className="text-foreground font-brand-bold text-lg">Nueva Promoción</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text className="text-primary font-body-bold">Cancelar</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 p-4">
                    {/* Type Selector */}
                    <View className="flex-row mb-6 bg-surface rounded-xl p-1 border border-surface-active">
                        <TouchableOpacity
                            onPress={() => setType('standard')}
                            className={`flex-1 py-2 rounded-lg items-center ${type === 'standard' ? 'bg-primary' : ''}`}
                        >
                            <Text className={`font-body-bold ${type === 'standard' ? 'text-white' : 'text-foreground-muted'}`}>
                                Estándar
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setType('uv_reward')}
                            className={`flex-1 py-2 rounded-lg items-center ${type === 'uv_reward' ? 'bg-accent-cyber' : ''}`}
                        >
                            <Text className={`font-body-bold ${type === 'uv_reward' ? 'text-black' : 'text-foreground-muted'}`}>
                                Recompensa UV
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Image Upload */}
                    <Text className="text-foreground font-body-bold mb-2">Imagen Promocional</Text>
                    <View className="mb-6">
                        <ImageGalleryEditor
                            images={imageUrl ? [imageUrl] : []}
                            onAddImage={handleImagePick}
                            onRemoveImage={() => setImageUrl(null)}
                            loading={uploading}
                        />
                    </View>

                    {/* Fields */}
                    <Text className="text-foreground font-body-bold mb-2">Título</Text>
                    <TextInput
                        className="bg-surface text-foreground p-4 rounded-xl mb-4 border border-surface-active"
                        placeholder="Ej: 2x1 en Mojitos"
                        placeholderTextColor="#6B7280"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text className="text-foreground font-body-bold mb-2">Descripción</Text>
                    <TextInput
                        className="bg-surface text-foreground p-4 rounded-xl mb-4 border border-surface-active min-h-[100px]"
                        placeholder="Detalles de la promoción..."
                        placeholderTextColor="#6B7280"
                        multiline
                        value={description}
                        onChangeText={setDescription}
                    />

                    {type === 'uv_reward' && (
                        <View>
                            <Text className="text-foreground font-body-bold mb-2">Costo en Puntos UV</Text>
                            <TextInput
                                className="bg-surface text-foreground p-4 rounded-xl mb-4 border border-surface-active"
                                keyboardType="numeric"
                                value={pointsCost}
                                onChangeText={setPointsCost}
                            />
                            <Text className="text-foreground-muted text-xs mb-4">
                                Los usuarios gastarán estos puntos para canjear la recompensa.
                            </Text>
                        </View>
                    )}

                </ScrollView>

                <View className="p-4 border-t border-surface-active bg-background">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={createMutation.isPending || uploading}
                        className="bg-primary p-4 rounded-xl items-center"
                    >
                        {createMutation.isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-brand-bold text-lg">Crear Promoción</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

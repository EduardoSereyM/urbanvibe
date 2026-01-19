import React from 'react';
import { View, Image, TouchableOpacity, ScrollView, Text, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageGalleryEditorProps {
    images: string[];
    onAddImage: () => void;
    onRemoveImage: (index: number) => void;
    loading?: boolean;
    readOnly?: boolean;
}

export function ImageGalleryEditor({ images, onAddImage, onRemoveImage, loading, readOnly = false }: ImageGalleryEditorProps) {
    return (
        <View className="bg-surface-deep rounded-xl p-4 border border-surface-active">
            <Text className="text-foreground-muted font-body-semibold mb-3 ml-1 text-xs uppercase tracking-wider">
                Galería de Portada
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {!readOnly && (
                    <TouchableOpacity
                        onPress={onAddImage}
                        disabled={loading}
                        className="mr-3 items-center justify-center bg-surface border border-dashed border-accent-cyber/30 rounded-xl h-32 w-48 shadow-sm hover:shadow-accent-cyber/50"
                    >
                        {loading ? (
                            <ActivityIndicator color="#00E0FF" />
                        ) : (
                            <View className="bg-primary rounded-full w-10 h-10 items-center justify-center shadow-lg shadow-primary/50">
                                <Ionicons name="add" size={24} color="white" />
                            </View>
                        )}
                        <Text className="text-foreground-muted text-xs mt-2">Agregar Foto</Text>
                    </TouchableOpacity>
                )}

                {images.map((uri, index) => (
                    <TouchableOpacity
                        key={`${uri}-${index}`}
                        onPress={() => {
                            if (!readOnly) {
                                Alert.alert(
                                    'Eliminar Imagen',
                                    '¿Estás seguro de que quieres eliminar esta imagen?',
                                    [
                                        { text: 'Cancelar', style: 'cancel' },
                                        {
                                            text: 'Eliminar',
                                            style: 'destructive',
                                            onPress: () => onRemoveImage(index)
                                        }
                                    ]
                                );
                            }
                        }}
                        className="mr-3 relative h-32 w-48 rounded-xl overflow-hidden border border-accent-cyber/20 shadow-sm"
                    >
                        <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                        {!readOnly && (
                            <View className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 backdrop-blur-sm">
                                <Ionicons name="trash" size={14} color="#EF4444" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

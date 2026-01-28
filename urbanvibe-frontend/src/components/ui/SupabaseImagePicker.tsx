
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, TextInput, ScrollView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

interface SupabaseImagePickerProps {
    onImageUploaded: (url: string) => void;
    currentImageUrl?: string;
    bucketName: string;
    defaultFolder?: string;
    label?: string;
}

export function SupabaseImagePicker({
    onImageUploaded,
    currentImageUrl,
    bucketName,
    defaultFolder = '',
    label = 'Imagen'
}: SupabaseImagePickerProps) {
    const [uploading, setUploading] = useState(false);
    const [folders, setFolders] = useState<string[]>([]);
    const [selectedFolder, setSelectedFolder] = useState(defaultFolder);
    const [newFolderName, setNewFolderName] = useState('');
    const [showFolderModal, setShowFolderModal] = useState(false);

    useEffect(() => {
        fetchFolders();
    }, [bucketName]);

    const fetchFolders = async () => {
        try {
            const { data, error } = await supabase.storage.from(bucketName).list();
            if (error) throw error;

            // Extract unique "folders" (items with no extension or explicitly metadata-based)
            // Note: Supabase doesn't have real folders, just prefixes. 
            // We'll treat common prefixes as folders.
            const existingFolders = new Set<string>();
            if (defaultFolder) existingFolders.add(defaultFolder);

            // We can also list deeper if needed, but for now let's keep it simple
            // and maybe just list top-level prefixes if we had a way.
            // Since .list() returns objects, we look for those without extensions 
            // or we could use a convention.
            // Let's just allow manual entry + common ones.
            setFolders(Array.from(existingFolders));
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        try {
            setUploading(true);

            const response = await fetch(uri);
            const blob = await response.blob();
            const fileExt = uri.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

            const path = selectedFolder
                ? `${selectedFolder.replace(/\/$/, '')}/${fileName}`
                : fileName;

            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(path, blob, {
                    contentType: 'image/jpeg', // Or dynamic
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(path);

            onImageUploaded(publicUrl);
        } catch (error: any) {
            alert('Error al subir imagen: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View className="mb-6">
            <Text className="text-gray-400 mb-2 font-bold text-xs uppercase tracking-wider">{label}</Text>

            <View className="flex-row items-center mb-4">
                <View className="bg-[#252A4A] px-3 py-2 rounded-lg border border-white/10 flex-row items-center flex-1 mr-2">
                    <Ionicons name="folder-outline" size={16} color="#828BA0" />
                    <Text className="text-white ml-2 text-xs">
                        Carpeta: <Text className="text-primary font-bold">{selectedFolder || '(raíz)'}</Text>
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => setShowFolderModal(true)}
                    className="bg-white/5 p-2 rounded-lg border border-white/10"
                >
                    <Ionicons name="settings-outline" size={20} color="white" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={pickImage}
                disabled={uploading}
                className="bg-[#252A4A] border-2 border-dashed border-white/10 rounded-2xl h-40 items-center justify-center overflow-hidden"
            >
                {uploading ? (
                    <ActivityIndicator size="large" color="#00E5FF" />
                ) : currentImageUrl ? (
                    <View className="w-full h-full">
                        <Image source={{ uri: currentImageUrl }} className="w-full h-full" resizeMode="cover" />
                        <View className="absolute inset-0 bg-black/40 items-center justify-center">
                            <Ionicons name="camera" size={32} color="white" />
                            <Text className="text-white font-bold mt-1">Cambiar Imagen</Text>
                        </View>
                    </View>
                ) : (
                    <View className="items-center">
                        <Ionicons name="cloud-upload-outline" size={40} color="#828BA0" />
                        <Text className="text-gray-400 mt-2">Presiona para subir</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Modal
                visible={showFolderModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowFolderModal(false)}
            >
                <View className="flex-1 bg-black/80 justify-center px-6">
                    <View className="bg-[#1B1D37] p-6 rounded-3xl border border-white/10">
                        <Text className="text-xl font-bold text-white mb-4">Configurar Carpeta</Text>

                        <Text className="text-gray-400 mb-2 text-xs uppercase">Nueva Carpeta / Prefijo</Text>
                        <TextInput
                            className="bg-[#252A4A] p-4 rounded-xl text-white border border-white/10 mb-6"
                            placeholder="badges, venues, assets..."
                            placeholderTextColor="#666"
                            value={newFolderName}
                            onChangeText={setNewFolderName}
                            autoCapitalize="none"
                        />

                        <TouchableOpacity
                            onPress={() => {
                                setSelectedFolder(newFolderName);
                                setShowFolderModal(false);
                            }}
                            className="bg-primary p-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold">Usar esta carpeta</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowFolderModal(false)}
                            className="mt-4 items-center"
                        >
                            <Text className="text-gray-400">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

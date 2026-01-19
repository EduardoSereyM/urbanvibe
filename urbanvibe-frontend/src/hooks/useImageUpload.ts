import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export function useImageUpload() {
    const [uploading, setUploading] = useState(false);

    const pickImage = async (aspect: [number, number] = [16, 9], allowEditing: boolean = true) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: allowEditing,
            aspect: allowEditing ? aspect : undefined,
            quality: 0.7,
        });

        if (!result.canceled) {
            return result.assets[0].uri;
        }
        return null;
    };

    const uploadImage = async (uri: string, folder: string) => {
        if (!uri) return null;
        if (uri.startsWith('http')) return uri; // Already uploaded

        setUploading(true);
        try {
            const response = await fetch(uri);
            const arrayBuffer = await response.arrayBuffer();
            const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

            const { data, error } = await supabase.storage
                .from('urbanvibe_media')
                .upload(filename, arrayBuffer, {
                    contentType: 'image/jpeg',
                });

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('urbanvibe_media')
                .getPublicUrl(filename);

            return publicUrlData.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    return {
        pickImage,
        uploadImage,
        uploading,
    };
}

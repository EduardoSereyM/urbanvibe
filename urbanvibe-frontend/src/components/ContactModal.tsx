import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { client } from '../api/client';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';

interface ContactModalProps {
    visible: boolean;
    onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ visible, onClose }) => {
    const { data: profile } = useProfile();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch email from Supabase Auth when modal opens
    React.useEffect(() => {
        if (visible) {
            supabase.auth.getUser().then(({ data }) => {
                if (data.user?.email) {
                    setEmail(data.user.email);
                }
            });
        }
    }, [visible]);

    const handleSubmit = async () => {
        if (!message.trim()) {
            Alert.alert('Error', 'Por favor escribe un mensaje.');
            return;
        }

        if (!email.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu correo electrónico.');
            return;
        }

        setLoading(true);
        try {
            await client.post('/contact', {
                email: email, // Always send email
                message: message,
                name: profile?.username || profile?.display_name || 'Usuario App',
            });
            Alert.alert('Éxito', 'Tu mensaje ha sido enviado. ¡Gracias por tus comentarios!');
            setMessage('');
            // Don't clear email if logged in
            if (!profile) setEmail('');
            onClose();
        } catch (error) {
            console.error('Error sending contact message:', error);
            Alert.alert('Error', 'Hubo un problema al enviar tu mensaje. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <TouchableOpacity
                        className="flex-1"
                        onPress={onClose}
                        activeOpacity={1}
                    />
                    <View className="bg-surface rounded-t-3xl border-t border-surface-active max-h-[90%]">
                        <View className="px-6 pt-6 pb-2 border-b border-surface-active flex-row justify-between items-center">
                            <Text className="font-brand text-xl text-foreground">
                                Déjanos un comentario
                            </Text>
                            <TouchableOpacity onPress={onClose} className="p-2 bg-surface-active rounded-full">
                                <Ionicons name="close" size={20} color="#FA4E35" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            className="p-6"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        >
                            <Text className="font-body text-foreground-muted mb-6">
                                Tu opinión es muy importante para nosotros. ¿Tienes alguna sugerencia o problema?
                            </Text>

                            <View className="mb-4">
                                <Text className="font-body-bold text-foreground mb-2">Correo Electrónico</Text>
                                <TextInput
                                    className={`bg-background text-foreground p-4 rounded-xl border border-surface-active font-body ${profile ? 'opacity-50' : ''}`}
                                    placeholder="tu@email.com"
                                    placeholderTextColor="#6B7280"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!profile}
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="font-body-bold text-foreground mb-2">Mensaje</Text>
                                <TextInput
                                    className="bg-background text-foreground p-4 rounded-xl border border-surface-active font-body min-h-[120px]"
                                    placeholder="Escribe tu comentario aquí..."
                                    placeholderTextColor="#6B7280"
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                    textAlignVertical="top"
                                    style={{ height: 150 }}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={loading}
                                className="bg-primary py-4 rounded-xl items-center shadow-lg mb-4"
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text className="text-primary-foreground font-brand text-lg">
                                        Enviar Mensaje
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

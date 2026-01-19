import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { ContactModal } from './ContactModal';

interface ExitConfirmationModalProps {
    visible: boolean;
    onCancel: () => void;
    onLogout: () => void;
    onExit: () => void;
}

export function ExitConfirmationModal({ visible, onCancel, onLogout, onExit }: ExitConfirmationModalProps) {
    const [contactModalVisible, setContactModalVisible] = useState(false);

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            {/* bg-black/70 controla el % de fade (70% de opacidad) */}
            <View className="flex-1 justify-center items-center bg-black/80 px-6">
                <View className="bg-surface w-full max-w-sm rounded-2xl p-6 border border-surface-active shadow-xl">
                    <Text className="text-2xl font-brand text-warning text-center mb-2">
                        ¿Salir de la aplicación?
                    </Text>
                    <Text className="text-foreground-muted font-body text-center mb-8">
                        ¿Deseas salir o cerrar sesión?
                    </Text>

                    <View className="w-full">
                        {/* Botón Salir */}
                        <TouchableOpacity
                            onPress={onExit}
                            // 
                            className="bg-surface-active py-3 px-4 rounded-xl border border-surface-active w-full mb-3"
                        >

                            <Text className="text-foreground font-brand text-center text-lg">
                                Salir de la App
                            </Text>
                        </TouchableOpacity>

                        {/* Botón Cerrar Sesión */}
                        <TouchableOpacity
                            onPress={onLogout}
                            className="bg-error/10 py-3 px-4 rounded-xl border border-primary/50 w-full mb-3"
                        >
                            <Text className="text-primary font-brand text-center text-lg">
                                Cerrar Sesión
                            </Text>
                        </TouchableOpacity>

                        {/* Botón Contacto */}
                        <TouchableOpacity
                            onPress={() => setContactModalVisible(true)}
                            className="bg-surface-active py-3 px-4 rounded-xl border border-surface-active w-full mb-3"
                        >
                            <Text className="text-foreground font-brand text-center text-lg">
                                Déjanos un comentario
                            </Text>
                        </TouchableOpacity>

                        {/* Botón Cancelar */}
                        <TouchableOpacity
                            onPress={onCancel}
                            className="py-3 px-4 w-full"
                        >
                            <Text className="text-foreground-muted font-body text-center">
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ContactModal
                visible={contactModalVisible}
                onClose={() => setContactModalVisible(false)}
            />
        </Modal>
    );
}

import React from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

interface Option {
    id: string | number;
    label: string;
}

interface SelectionModalProps {
    visible: boolean;
    title: string;
    options: Option[];
    onSelect: (option: Option) => void;
    onClose: () => void;
}

export function SelectionModal({ visible, title, options, onSelect, onClose }: SelectionModalProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-surface rounded-t-3xl h-[50%] border-t border-surface-active">
                    <View className="p-4 border-b border-surface-active flex-row justify-between items-center">
                        <Text className="text-xl font-brand text-foreground">{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text className="text-primary font-body-semibold">Cerrar</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={options}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                                className="py-4 border-b border-surface-active"
                            >
                                <Text className="text-foreground font-body text-lg">{item.label}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}

import React from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { OpeningHoursConfig, OpeningHoursRegularSlot, OpeningHoursException } from '../../api/types';
import { Ionicons } from '@expo/vector-icons';

interface OpeningHoursEditorProps {
    value?: OpeningHoursConfig | null;
    onChange: (value: OpeningHoursConfig) => void;
    readOnly?: boolean;
}

const DAYS_TRANSLATION: Record<string, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

const DEFAULT_REGULAR: OpeningHoursRegularSlot[] = [
    { day: 'monday', open: '09:00', close: '18:00', closed: false },
    { day: 'tuesday', open: '09:00', close: '18:00', closed: false },
    { day: 'wednesday', open: '09:00', close: '18:00', closed: false },
    { day: 'thursday', open: '09:00', close: '18:00', closed: false },
    { day: 'friday', open: '09:00', close: '18:00', closed: false },
    { day: 'saturday', open: '10:00', close: '14:00', closed: false },
    { day: 'sunday', closed: true },
];

export function OpeningHoursEditor({ value, onChange, readOnly = false }: OpeningHoursEditorProps) {
    const config = value || {
        timezone: 'America/Santiago',
        regular: DEFAULT_REGULAR,
        exceptions: [],
    };

    const handleRegularChange = (index: number, field: keyof OpeningHoursRegularSlot, val: any) => {
        if (readOnly) return;
        const newRegular = [...config.regular];
        newRegular[index] = { ...newRegular[index], [field]: val };
        onChange({ ...config, regular: newRegular });
    };

    const handleAddException = () => {
        if (readOnly) return;
        const newExceptions = [
            ...(config.exceptions || []),
            { date: '', label: '', closed: true } as OpeningHoursException,
        ];
        onChange({ ...config, exceptions: newExceptions });
    };

    const handleExceptionChange = (index: number, field: keyof OpeningHoursException, val: any) => {
        if (readOnly) return;
        const newExceptions = [...(config.exceptions || [])];
        newExceptions[index] = { ...newExceptions[index], [field]: val };
        onChange({ ...config, exceptions: newExceptions });
    };

    const handleRemoveException = (index: number) => {
        if (readOnly) return;
        const newExceptions = [...(config.exceptions || [])];
        newExceptions.splice(index, 1);
        onChange({ ...config, exceptions: newExceptions });
    };

    return (
        <View className="space-y-6">
            <View className='mb-6'>
                <Text className="font-brand text-xl text-foreground mb-4">Horario Regular</Text>
                <View className="bg-surface-deep rounded-xl p-4 border border-surface-active">
                    {config.regular.map((slot, index) => (
                        <View key={slot.day} className="py-3 border-b border-surface-active/50 last:border-0">
                            <View className="mb-2">
                                <Text className="font-brand text-foreground capitalize text-base">
                                    {DAYS_TRANSLATION[slot.day] || slot.day}
                                </Text>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-2">
                                    {!slot.closed ? (
                                        <>
                                            <TextInput
                                                value={slot.open || ''}
                                                onChangeText={(text) => {
                                                    // Allow only numbers and colon
                                                    const cleaned = text.replace(/[^0-9:]/g, '');
                                                    // Auto-insert colon
                                                    let formatted = cleaned;
                                                    if (cleaned.length === 2 && !cleaned.includes(':') && (slot.open || '').length < 2) {
                                                        formatted = cleaned + ':';
                                                    }
                                                    // Limit length
                                                    if (formatted.length > 5) return;

                                                    handleRegularChange(index, 'open', formatted);
                                                }}
                                                placeholder="09:00"
                                                placeholderTextColor="#F2F1F0"
                                                className={`bg-surface border border-accent-cyber/20 w-20 py-1.5 rounded-lg text-accent-turquesa text-center font-mono ${readOnly ? 'opacity-80' : ''}`}
                                                maxLength={5}
                                                editable={!readOnly}
                                            />
                                            <Text className="text-foreground-muted">-</Text>
                                            <TextInput
                                                value={slot.close || ''}
                                                onChangeText={(text) => {
                                                    const cleaned = text.replace(/[^0-9:]/g, '');
                                                    let formatted = cleaned;
                                                    if (cleaned.length === 2 && !cleaned.includes(':') && (slot.close || '').length < 2) {
                                                        formatted = cleaned + ':';
                                                    }
                                                    if (formatted.length > 5) return;

                                                    handleRegularChange(index, 'close', formatted);
                                                }}
                                                placeholder="18:00"
                                                placeholderTextColor="#989EB3"
                                                className={`bg-surface border border-accent-cyber/20 w-20 py-1.5 rounded-lg text-accent-turquesa text-center font-mono ${readOnly ? 'opacity-80' : ''}`}
                                                maxLength={5}
                                                editable={!readOnly}
                                            />
                                        </>
                                    ) : (
                                        <Text className="text-foreground-muted italic text-sm">Close</Text>
                                    )}
                                </View>

                                <View>
                                    <Switch
                                        value={!slot.closed}
                                        onValueChange={(val) => handleRegularChange(index, 'closed', !val)}
                                        trackColor={{ false: '#083D77', true: '#083D77' }}
                                        thumbColor={!slot.closed ? '#00E0FF' : '#FA4E35'}
                                        disabled={readOnly}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            <View>
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="font-brand text-xl text-foreground">Excepciones</Text>
                    {!readOnly && (
                        <TouchableOpacity
                            onPress={handleAddException}
                            className="bg-surface-active px-3 py-1 rounded-full border border-accent-turquesa"
                        >
                            <Text className="text-accent-turquesa font-bold text-xs">+ Agregar</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View className="bg-surface-deep rounded-xl overflow-hidden border border-surface-active">
                    <View className="flex-row bg-surface-active/30 px-4 py-2 border-b border-surface-active">
                        <Text className="flex-1 text-xs text-foreground-muted uppercase font-bold">Fecha</Text>
                        <Text className="flex-1 text-xs text-foreground-muted uppercase font-bold">Descripción</Text>
                        <Text className="w-20 text-xs text-foreground-muted uppercase font-bold text-center">Estado</Text>
                        {!readOnly && <View className="w-8" />}
                    </View>

                    {config.exceptions?.map((exc, index) => (
                        <View key={index} className="flex-row items-center px-4 py-3 border-b border-surface-active/50 last:border-0 hover:bg-surface-active/10">
                            <View className="flex-1 pr-2">
                                <TextInput
                                    value={exc.date}
                                    onChangeText={(text) => handleExceptionChange(index, 'date', text)}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#666"
                                    className={`text-foreground font-mono text-sm ${readOnly ? 'opacity-50' : ''}`}
                                    editable={!readOnly}
                                />
                            </View>
                            <View className="flex-1 pr-2">
                                <TextInput
                                    value={exc.label || ''}
                                    onChangeText={(text) => handleExceptionChange(index, 'label', text)}
                                    placeholder="Ej. Navidad"
                                    placeholderTextColor="#666"
                                    className={`text-foreground text-sm ${readOnly ? 'opacity-50' : ''}`}
                                    editable={!readOnly}
                                />
                            </View>
                            <View className="w-20 items-center">
                                <Switch
                                    value={exc.closed}
                                    onValueChange={(val) => handleExceptionChange(index, 'closed', val)}
                                    trackColor={{ false: '#252A4A', true: '#083D77' }}
                                    thumbColor={exc.closed ? '#00E0FF' : '#989EB3'}
                                    disabled={readOnly}
                                />
                            </View>
                            {!readOnly && (
                                <TouchableOpacity
                                    onPress={() => handleRemoveException(index)}
                                    className="w-8 items-end"
                                >
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                    {(!config.exceptions || config.exceptions.length === 0) && (
                        <View className="p-4 items-center">
                            <Text className="text-foreground-muted italic text-sm">
                                No hay excepciones configuradas.
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

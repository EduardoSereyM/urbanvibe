import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

interface MultiSelectTagProps {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    disabled?: boolean;
}

export function MultiSelectTag({ label, options, selected = [], onChange, disabled = false }: MultiSelectTagProps) {
    const toggleOption = (option: string) => {
        if (disabled) return;
        if (selected.includes(option)) {
            onChange(selected.filter((item) => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    return (
        <View className="mb-4">
            {label ? <Text className="text-foreground-muted font-body-semibold mb-3 ml-1 text-xs uppercase tracking-wider">{label}</Text> : null}
            <View className="flex-row flex-wrap gap-3">
                {options.map((option) => {
                    const isSelected = selected.includes(option);
                    return (
                        <TouchableOpacity
                            key={option}
                            onPress={() => toggleOption(option)}
                            disabled={disabled}
                            className={`px-4 py-2 rounded-full border ${isSelected
                                ? 'bg-primary border-transparent'
                                : 'bg-surface-deep border-accent-cyber/30'
                                } ${disabled ? 'opacity-50' : ''}`}
                        >
                            <Text
                                className={`text-xs font-body ${isSelected ? 'text-white font-bold' : 'text-foreground-muted'
                                    }`}
                            >
                                {option.replace(/_/g, ' ')}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

interface ProfileEditorProps {
    label: string;
    value: Record<string, any>;
    onChange: (value: Record<string, any>) => void;
    fields: { key: string; label: string; type: 'text' | 'select' | 'multi-select' | 'number'; options?: string[] }[];
    disabled?: boolean;
}

export function ProfileEditor({ label, value = {}, onChange, fields, disabled = false }: ProfileEditorProps) {
    const updateField = (key: string, val: any) => {
        if (disabled) return;
        onChange({ ...value, [key]: val });
    };

    return (
        <View className="mb-4 bg-surface rounded-xl p-6 shadow-sm">
            <Text className="text-foreground font-brand text-xl mb-4">{label}</Text>
            {fields.map((field) => (
                <View key={field.key} className="mb-4">
                    <Text className="text-foreground-muted font-body-semibold mb-2 ml-1 text-xs uppercase tracking-wider">{field.label}</Text>
                    {field.type === 'text' && (
                        <TextInput
                            value={value[field.key] || ''}
                            onChangeText={(text) => updateField(field.key, text)}
                            className={`bg-surface-deep border border-accent-cyber/20 rounded-xl px-4 py-3 text-foreground font-body focus:border-accent-cyber focus:shadow-lg ${disabled ? 'opacity-50' : ''}`}
                            editable={!disabled}
                            placeholderTextColor="#989EB3"
                        />
                    )}
                    {field.type === 'number' && (
                        <TextInput
                            value={String(value[field.key] || '')}
                            onChangeText={(text) => updateField(field.key, Number(text))}
                            keyboardType="numeric"
                            className={`bg-surface-deep border border-accent-cyber/20 rounded-xl px-4 py-3 text-foreground font-body focus:border-accent-cyber focus:shadow-lg ${disabled ? 'opacity-50' : ''}`}
                            editable={!disabled}
                            placeholderTextColor="#989EB3"
                        />
                    )}
                    {field.type === 'select' && field.options && (
                        <View className="flex-row flex-wrap gap-2">
                            {field.options.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    onPress={() => updateField(field.key, opt)}
                                    disabled={disabled}
                                    className={`px-3 py-1.5 rounded-full border ${value[field.key] === opt
                                        ? 'bg-surface-active border-accent-turquesa'
                                        : 'bg-surface-deep border-surface-active'
                                        } ${disabled ? 'opacity-50' : ''}`}
                                >
                                    <Text className={`text-xs font-body ${value[field.key] === opt ? 'text-accent-turquesa font-bold' : 'text-foreground-muted'}`}>
                                        {opt}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    {field.type === 'multi-select' && field.options && (
                        <MultiSelectTag
                            label=""
                            options={field.options}
                            selected={value[field.key] || []}
                            onChange={(val) => updateField(field.key, val)}
                            disabled={disabled}
                        />
                    )}
                </View>
            ))}
        </View>
    );
}

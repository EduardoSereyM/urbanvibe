import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminUserUpdatePayload } from '../../../src/api/types';
import { useAdminUserDetail, useUpdateAdminUser } from '../../../src/hooks/useAdminUsers';

// Simple section header component
const SectionHeader = ({ title }: { title: string }) => (
    <View className="mb-4 mt-6 border-b border-border/50 pb-2">
        <Text className="text-xl font-heading text-primary">{title}</Text>
    </View>
);

const InputField = ({ label, value, onChange, placeholder, keyboardType = 'default', multiline = false }: any) => (
    <View className="mb-4">
        <Text className="text-foreground-muted mb-2 text-sm uppercase tracking-wide">{label}</Text>
        <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor="#666"
            keyboardType={keyboardType}
            multiline={multiline}
            className={`bg-surface p-4 rounded-xl text-foreground border border-border ${multiline ? 'h-24' : ''}`}
        />
    </View>
);

const ToggleField = ({ label, value, onChange }: any) => (
    <View className="flex-row items-center justify-between mb-4 bg-surface p-4 rounded-xl border border-border">
        <Text className="text-foreground font-medium">{label}</Text>
        <Switch
            value={value}
            onValueChange={onChange}
            trackColor={{ false: '#333', true: '#FA4E35' }}
            thumbColor={value ? '#fff' : '#888'}
        />
    </View>
);

export default function AdminUserDetailScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { data: user, isLoading, error } = useAdminUserDetail(userId!);
    const updateMutation = useUpdateAdminUser();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<AdminUserUpdatePayload>({});

    useEffect(() => {
        if (user) {
            setFormData({
                // Identity
                username: user.username || '',
                full_name: user.full_name || '',
                display_name: user.display_name || '',
                national_id: user.national_id || '',
                avatar_url: user.avatar_url || '',
                bio: user.bio || '',
                website: user.website || '',

                // Status
                status: user.status || 'active',
                is_verified: user.is_verified,
                is_influencer: user.is_influencer,
                is_active: user.is_active,

                // Role
                role_id: user.role_id,

                // Gamification
                reputation_score: user.reputation_score,
                points_current: user.points_current,
                points_lifetime: user.points_lifetime,
                reviews_count: user.reviews_count,

                // Location
                current_city: user.current_city || '',

                // Referral
                referral_source: user.referral_source || '',
            });
        }
    }, [user]);

    const handleSave = () => {
        if (!userId) return;

        updateMutation.mutate(
            { userId, payload: formData },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    Alert.alert('Éxito', 'Usuario actualizado correctamente');
                },
                onError: (err) => {
                    Alert.alert('Error', 'No se pudo actualizar el usuario');
                    console.error(err);
                },
            }
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color="#FA4E35" />
            </View>
        );
    }

    if (error || !user) {
        return (
            <View className="flex-1 justify-center items-center bg-background p-6">
                <Text className="text-destructive text-lg mb-2">Error al cargar usuario</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-surface px-4 py-2 rounded-lg">
                    <Text className="text-foreground">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
            {/* Header Sticky */}
            <View className="px-6 py-4 border-b border-border flex-row items-center justify-between bg-background z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Text className="text-2xl text-foreground">←</Text>
                    </TouchableOpacity>
                    <View>
                        <Text className="font-heading text-xl text-foreground">
                            {isEditing ? 'Editar Usuario' : 'Detalle de Usuario'}
                        </Text>
                        <Text className="text-xs text-foreground-muted uppercase tracking-widest">Admin Panel</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        if (isEditing) handleSave();
                        else setIsEditing(true);
                    }}
                    disabled={updateMutation.isPending}
                    className={`px-6 py-2 rounded-full ${isEditing ? 'bg-primary' : 'bg-surface-highlight border border-border'}`}
                >
                    {updateMutation.isPending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text className={`font-bold ${isEditing ? 'text-white' : 'text-foreground'}`}>
                            {isEditing ? 'Guardar' : 'Editar'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* 1. Identity Section */}
                <View className="items-center mt-6 mb-8">
                    <View className="w-24 h-24 bg-surface-highlight rounded-full items-center justify-center mb-4 overflow-hidden border-2 border-primary">
                        {formData.avatar_url ? (
                            <Image source={{ uri: formData.avatar_url }} className="w-full h-full" />
                        ) : (
                            <Text className="text-4xl">👤</Text>
                        )}
                    </View>
                    <Text className="font-heading text-2xl text-foreground text-center">
                        {user.display_name || user.username || 'Sin nombre'}
                    </Text>
                    <Text className="text-foreground-muted mt-1">{user.email}</Text>
                    <View className="bg-primary/20 px-3 py-1 rounded-full mt-2">
                        <Text className="text-primary font-bold text-xs uppercase">{user.role_name || 'Sin Rol'}</Text>
                    </View>
                </View>

                {isEditing ? (
                    <>
                        <SectionHeader title="Identidad" />
                        <InputField label="Username (Único)" value={formData.username} onChange={(t: string) => setFormData({ ...formData, username: t })} />
                        <InputField label="Nombre Completo" value={formData.full_name} onChange={(t: string) => setFormData({ ...formData, full_name: t })} />
                        <InputField label="Nombre Display" value={formData.display_name} onChange={(t: string) => setFormData({ ...formData, display_name: t })} />
                        <InputField label="RUT / ID Nacional" value={formData.national_id} onChange={(t: string) => setFormData({ ...formData, national_id: t })} />
                        <InputField label="Bio" value={formData.bio} onChange={(t: string) => setFormData({ ...formData, bio: t })} multiline />
                        <InputField label="Website" value={formData.website} onChange={(t: string) => setFormData({ ...formData, website: t })} />
                        <InputField label="Avatar URL" value={formData.avatar_url} onChange={(t: string) => setFormData({ ...formData, avatar_url: t })} />

                        <SectionHeader title="Estado y Roles" />
                        <View className="mb-4">
                            <Text className="text-foreground-muted mb-2 text-sm uppercase tracking-wide">Rol de Usuario</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {[
                                    { id: 1, name: 'SUPER_ADMIN' },
                                    { id: 2, name: 'VENUE_OWNER' },
                                    { id: 3, name: 'VENUE_MANAGER' },
                                    { id: 4, name: 'VENUE_STAFF' },
                                    { id: 5, name: 'APP_USER' }
                                ].map((role) => (
                                    <TouchableOpacity
                                        key={role.id}
                                        onPress={() => setFormData({ ...formData, role_id: role.id })}
                                        className={`px-4 py-2 rounded-lg border ${formData.role_id === role.id ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
                                    >
                                        <Text className={formData.role_id === role.id ? 'text-white font-bold' : 'text-foreground-muted'}>
                                            {role.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <ToggleField
                            label="Cuenta Activa (Login permitido)"
                            value={formData.is_active}
                            onChange={(val: boolean) => setFormData({ ...formData, is_active: val })}
                        />
                        <ToggleField
                            label="Usuario Verificado"
                            value={formData.is_verified}
                            onChange={(val: boolean) => setFormData({ ...formData, is_verified: val })}
                        />
                        <ToggleField
                            label="Es Influencer"
                            value={formData.is_influencer}
                            onChange={(val: boolean) => setFormData({ ...formData, is_influencer: val })}
                        />
                        <InputField label="Estado (Texto)" value={formData.status} onChange={(t: string) => setFormData({ ...formData, status: t })} />

                        <SectionHeader title="Gamification & Stats" />
                        <View className="flex-row space-x-4">
                            <View className="flex-1">
                                <InputField label="Puntos Actuales" value={String(formData.points_current)} keyboardType="numeric" onChange={(t: string) => setFormData({ ...formData, points_current: Number(t) })} />
                            </View>
                            <View className="flex-1">
                                <InputField label="Reputación" value={String(formData.reputation_score)} keyboardType="numeric" onChange={(t: string) => setFormData({ ...formData, reputation_score: Number(t) })} />
                            </View>
                        </View>
                        <InputField label="Puntos Históricos (Lifetime)" value={String(formData.points_lifetime)} keyboardType="numeric" onChange={(t: string) => setFormData({ ...formData, points_lifetime: Number(t) })} />

                        <SectionHeader title="Ubicación y Referidos" />
                        <InputField label="Ciudad Actual" value={formData.current_city} onChange={(t: string) => setFormData({ ...formData, current_city: t })} />
                        <InputField label="Fuente de Referido" value={formData.referral_source} onChange={(t: string) => setFormData({ ...formData, referral_source: t })} />

                    </>
                ) : (
                    <>
                        {/* READ ONLY VIEW */}
                        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border space-y-4">
                            <DetailRow label="Username" value={user.username || '-'} />
                            <DetailRow label="Nombre Completo" value={user.full_name || '-'} />
                            <DetailRow label="ID Nacional" value={user.national_id || '-'} />
                            <DetailRow label="Bio" value={user.bio || '-'} />
                            <DetailRow label="Website" value={user.website || '-'} />
                            <DetailRow label="Ciudad" value={user.current_city || '-'} />
                        </View>

                        <View className="flex-row justify-between mb-6">
                            <StatusBadge label="Activo" isActive={user.is_active} />
                            <StatusBadge label="Verificado" isActive={user.is_verified} />
                            <StatusBadge label="Influencer" isActive={user.is_influencer} />
                        </View>

                        <Text className="font-heading text-lg text-foreground mb-3">Estadísticas</Text>
                        <View className="bg-surface rounded-2xl p-4 mb-6 border border-border">
                            <DetailRow label="Puntos Actuales" value={user.points_current} />
                            <DetailRow label="Puntos Totales" value={user.points_lifetime} />
                            <DetailRow label="Reputación" value={user.reputation_score} />
                            <DetailRow label="Reviews Reales" value={user.reviews_count} />
                            <DetailRow label="Check-ins" value={user.verified_checkins_count} />
                        </View>

                        {/* JSON Data Dump for advanced debugging */}
                        <TouchableOpacity
                            onPress={() => Alert.alert("Raw Data", JSON.stringify(user, null, 2))}
                            className="bg-surface-highlight p-4 rounded-xl mt-4"
                        >
                            <Text className="text-primary font-mono text-center text-xs">Ver JSON Completo</Text>
                        </TouchableOpacity>

                        {/* Venues Owned */}
                        {user.venues_owned.length > 0 && (
                            <>
                                <Text className="font-heading text-lg text-foreground mb-3 mt-6">Locales ({user.venues_owned.length})</Text>
                                {user.venues_owned.map((venue) => (
                                    <TouchableOpacity
                                        key={venue.id}
                                        onPress={() => router.push(`/(admin)/venues/${venue.id}`)}
                                        className="bg-surface rounded-xl p-4 mb-3 border border-border flex-row justify-between items-center"
                                    >
                                        <View>
                                            <Text className="font-bold text-foreground">{venue.name}</Text>
                                            <Text className="text-xs text-foreground-muted">{venue.role}</Text>
                                        </View>
                                        <Text className="text-2xl text-foreground">→</Text>
                                    </TouchableOpacity>
                                ))}
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
    return (
        <View className="flex-row justify-between py-2 border-b border-border/10 last:border-0">
            <Text className="text-foreground-muted font-body">{label}</Text>
            <Text className="text-foreground font-medium flex-1 text-right ml-4" numberOfLines={1}>{value}</Text>
        </View>
    );
}

function StatusBadge({ label, isActive }: { label: string, isActive: boolean }) {
    return (
        <View className={`px-3 py-2 rounded-lg border ${isActive ? 'bg-green-500/10 border-green-500' : 'bg-surface border-border'}`}>
            <Text className={`${isActive ? 'text-green-500' : 'text-foreground-muted'} font-bold text-xs uppercase`}>
                {isActive ? '✓ ' : ''}{label}
            </Text>
        </View>
    )
}

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminUsersFilters } from '../../../src/api/types';
import { useAdminUsersList } from '../../../src/hooks/useAdminUsers';
import { useDebounce } from '../../../src/hooks/useDebounce';

export default function AdminUsersListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);

    const filters: AdminUsersFilters = {
        search: debouncedSearch,
        role: roleFilter,
        limit: 50,
    };

    const { data, isLoading, error } = useAdminUsersList(filters);

    return (
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="px-6 py-4 border-b border-border">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Text className="text-2xl">←</Text>
                    </TouchableOpacity>
                    <Text className="font-heading text-2xl text-foreground">
                        Usuarios
                    </Text>
                </View>

                {/* Search Bar */}
                <View className="bg-surface-highlight rounded-xl p-3 flex-row items-center mb-4">
                    <Text className="mr-2">🔍</Text>
                    <TextInput
                        placeholder="Buscar por nombre o email..."
                        placeholderTextColor="#666"
                        className="flex-1 font-body text-foreground"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {/* Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    <FilterChip
                        label="Todos"
                        isActive={!roleFilter}
                        onPress={() => setRoleFilter(undefined)}
                    />
                    <FilterChip
                        label="Dueños"
                        isActive={roleFilter === 'VENUE_OWNER'}
                        onPress={() => setRoleFilter('VENUE_OWNER')}
                    />
                    <FilterChip
                        label="Staff"
                        isActive={roleFilter === 'VENUE_STAFF'}
                        onPress={() => setRoleFilter('VENUE_STAFF')}
                    />
                    <FilterChip
                        label="Usuarios"
                        isActive={roleFilter === 'APP_USER'}
                        onPress={() => setRoleFilter('APP_USER')}
                    />
                </ScrollView>
            </View>

            {/* Content */}
            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#00E5FF" />
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center p-6">
                    <Text className="text-destructive text-center mb-4">Error al cargar usuarios</Text>
                    <Text className="text-foreground-muted text-center">
                        {(error as Error).message}
                    </Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-6 pt-4">
                    <Text className="text-foreground-muted mb-4">
                        {data?.total || 0} usuarios encontrados
                    </Text>

                    {data?.users.map((user) => (
                        <TouchableOpacity
                            key={user.id}
                            onPress={() => router.push(`/(admin)/users/${user.id}`)}
                            className="bg-surface rounded-xl p-4 mb-3 border border-border"
                        >
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-1">
                                        <Text className="font-brand text-lg text-foreground mr-2">
                                            {user.username || user.display_name || 'Sin nombre'}
                                        </Text>
                                        {user.roles.map((role, index) => (
                                            <View key={`${role}-${index}`} className="bg-primary/10 px-2 py-0.5 rounded-md">
                                                <Text className="text-xs font-bold text-primary">{role}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <Text className="font-body text-sm text-foreground-muted">
                                        {user.email}
                                    </Text>
                                </View>
                                <View className={`px-2 py-1 rounded-full ${user.is_active ? 'bg-success/20' : 'bg-destructive/20'}`}>
                                    <Text className={`text-xs font-bold ${user.is_active ? 'text-success' : 'text-destructive'}`}>
                                        {user.is_active ? 'ACTIVO' : 'INACTIVO'}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row flex-wrap gap-2 mt-2">
                                {/* Roles moved up */}
                            </View>

                            <View className="flex-row mt-3 pt-3 border-t border-border/50">
                                <Text className="text-xs text-foreground-muted mr-4">
                                    ⭐ {user.reputation_score} Rep
                                </Text>
                                <Text className="text-xs text-foreground-muted mr-4">
                                    🏆 {user.points_current} Pts
                                </Text>
                                <Text className="text-xs text-foreground-muted">
                                    🏢 {user.total_venues} Locales
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                    <View className="h-20" />
                </ScrollView>
            )}
        </View>
    );
}

function FilterChip({ label, isActive, onPress }: { label: string; isActive: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`px-4 py-2 rounded-full mr-2 border ${isActive ? 'bg-primary border-primary' : 'bg-transparent border-border'
                }`}
        >
            <Text className={`font-bold ${isActive ? 'text-background' : 'text-foreground-muted'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

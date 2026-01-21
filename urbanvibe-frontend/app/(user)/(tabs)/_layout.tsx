// Layout de tabs del usuario (Explorar, Lista, Favoritos, Perfil) con barra inferior estilizada según diseño UV.
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Iconos de MaterialCommunityIcons
import FontWeight5 from '@expo/vector-icons/FontAwesome5'; // Iconos de FontAwesome5
import { useQuery } from '@tanstack/react-query';
import { client } from '../../../src/api/client';

export default function UserTabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#1B1D37',
                    borderTopColor: '#252A4A',
                    borderTopWidth: 1,
                    height: Platform.OS === 'android' ? 60 : 80,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#FA4E35', // Aventura UV
                tabBarInactiveTintColor: '#fa4f3585',
            }}
        >
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explorar',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "map" : "map-outline"} size={28} color={color} />
                        //<MaterialCommunityIcons name="map-search-outline" size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="venues"
                options={{
                    title: 'Locales',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "list" : "list-outline"} size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: 'Favoritos',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "heart" : "heart-outline"} size={28} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Avisos',
                    tabBarIcon: ({ color, focused }) => {
                        const { data: unreadData } = useQuery({
                            queryKey: ['unread-count'],
                            queryFn: async () => {
                                const response = await client.get('/notifications/unread-count');
                                return response.data;
                            },
                        });
                        const count = unreadData?.count || 0;

                        return (
                            <View className="relative">
                                <Ionicons name={focused ? "notifications" : "notifications-outline"} size={28} color={color} />
                                {count > 0 && (
                                    <View className="absolute -top-1 -right-1 bg-primary w-4 h-4 rounded-full items-center justify-center border border-surface">
                                        <Text className="text-white text-[8px] font-bold">{count > 9 ? '9+' : count}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    },
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={28} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

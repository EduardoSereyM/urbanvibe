// Layout de tabs del usuario (Explorar, Lista, Favoritos, Perfil) con barra inferior estilizada según diseño UV.
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Iconos de MaterialCommunityIcons
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'; // Iconos de FontAwesome5

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
                    tabBarIcon: ({ color, focused }) => (
                        <View className="relative">
                            <Ionicons name={focused ? "notifications" : "notifications-outline"} size={28} color={color} />
                            {/* TODO: Add badge count logic here if possible, or just rely on the screen */}
                        </View>
                    ),
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

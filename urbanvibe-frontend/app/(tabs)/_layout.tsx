import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Oculta el texto de los botones para lograr el look del mockup
        tabBarShowLabel: false, 
        tabBarStyle: {
          backgroundColor: '#1B1D37', // Fondo La Noche UV
          borderTopColor: '#252A4A',  // Borde sutil arriba
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 60 : 80, // Altura cómoda
          paddingTop: 8, // Centrar iconos verticalmente
        },
        tabBarActiveTintColor: '#FF00CC',   // Fucsia Neón para el activo (más visible en dark)
        tabBarInactiveTintColor: '#606270', // Gris apagado para inactivos
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, focused }) => (
            // Icono lleno si está activo, contorno si no
            <Ionicons 
              name={focused ? "map" : "map-outline"} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
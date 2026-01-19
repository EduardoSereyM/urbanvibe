import { Tabs, useRouter, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useVenueContext } from '../../../src/context/VenueContext';
import { useAdminVenueDetail } from '../../../src/hooks/useAdminVenues';

export default function VenueTabsLayout() {
    const router = useRouter();
    const pathname = usePathname();
    const { currentVenueId } = useVenueContext();
    const { data: venue } = useAdminVenueDetail(currentVenueId || '');
    const [unreadCount, setUnreadCount] = useState(0);

    // Calculate Unread Badge
    useEffect(() => {
        if (venue) {
            setUnreadCount(venue.unread_reviews_count || 0);
        }
    }, [venue]);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#fa4f35de', // Primary
                tabBarInactiveTintColor: '#F2F1F075', // Muted
                tabBarStyle: {
                    backgroundColor: '#232959', // Surface color
                    borderTopColor: '#2A303C',
                    height: Platform.OS === 'ios' ? 95 : 75,
                    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
                    paddingTop: 8,
                    paddingHorizontal: 14,
                    // Hide tab bar on the main locales list
                    display: pathname.endsWith('/locales') ? 'none' : 'flex',
                },
            }}
        >

            <Tabs.Screen
                name="locales"
                options={{
                    title: 'Locales',
                    // tabBarStyle: { display: 'none' }, // Removed to show bottom menu
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="storefront" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="qr-checkin"
                options={{
                    title: 'Check-in',
                    href: currentVenueId ? undefined : null,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="qr-code" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="reviews"
                options={{
                    title: 'Reseñas',
                    href: currentVenueId ? undefined : null,
                    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbox-ellipses" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="promotions"
                options={{
                    title: 'Promos',
                    href: currentVenueId ? undefined : null,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="pricetag" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="media"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}

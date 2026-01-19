import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function VenueDetailRedirect() {
    const { venueId } = useLocalSearchParams<{ venueId: string }>();
    return <Redirect href={`/(venue)/(tabs)/locales/${venueId}`} />;
}

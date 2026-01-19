import { Redirect } from 'expo-router';
import React from 'react';

export default function VenueIndexRedirect() {
    return <Redirect href="/(venue)/(tabs)/locales" />;
}

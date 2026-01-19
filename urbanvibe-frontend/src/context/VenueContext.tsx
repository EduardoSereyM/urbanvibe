import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface VenueContextType {
    currentVenueId: string | null;
    setCurrentVenueId: (id: string | null) => void;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

export function VenueProvider({ children }: { children: React.ReactNode }) {
    const [currentVenueId, setCurrentVenueId] = useState<string | null>(null);

    // Load from storage on mount
    useEffect(() => {
        AsyncStorage.getItem('currentVenueId').then((id) => {
            if (id) setCurrentVenueId(id);
        });
    }, []);

    // Save to storage on change
    const setVenueId = (id: string | null) => {
        setCurrentVenueId(id);
        if (id) {
            AsyncStorage.setItem('currentVenueId', id);
        } else {
            AsyncStorage.removeItem('currentVenueId');
        }
    };

    return (
        <VenueContext.Provider value={{ currentVenueId, setCurrentVenueId: setVenueId }}>
            {children}
        </VenueContext.Provider>
    );
}

export function useVenueContext() {
    const context = useContext(VenueContext);
    if (context === undefined) {
        throw new Error('useVenueContext must be used within a VenueProvider');
    }
    return context;
}

export const useVenue = useVenueContext;

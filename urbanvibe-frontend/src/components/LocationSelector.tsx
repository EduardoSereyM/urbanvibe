import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocations } from '../hooks/useLocations';

interface LocationSelectorProps {
    countryCode?: string;
    regionId?: number;
    cityId?: number;
    onCountryChange: (code: string) => void;
    onRegionChange: (id: number) => void;
    onCityChange: (id: number) => void;
    labelColor?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    countryCode,
    regionId,
    cityId,
    onCountryChange,
    onRegionChange,
    onCityChange,
    labelColor = "text-white"
}) => {
    const { countries, regions, cities, loadRegions, loadCities, loading } = useLocations();

    // Initial Data Load (if editing existing)
    useEffect(() => {
        if (countryCode) {
            loadRegions(countryCode);
        }
    }, [countryCode]); // Depend only on countryCode change logic handled by parent usually, but hook needs trigger

    useEffect(() => {
        if (regionId) {
            loadCities(regionId);
        }
    }, [regionId]);

    const handleCountrySelect = (code: string) => {
        onCountryChange(code);
        loadRegions(code);
        // Parent should handle clearing regionId/cityId
    };

    const handleRegionSelect = (id: number) => {
        onRegionChange(id);
        loadCities(id);
    };

    return (
        <View className="space-y-4">
            {/* Country */}
            <View>
                <Text className={`${labelColor} mb-1 font-brand-bold`}>País {loading && <ActivityIndicator size="small" />}</Text>
                <View className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <Picker
                        selectedValue={countryCode}
                        onValueChange={(itemValue) => handleCountrySelect(itemValue)}
                        dropdownIconColor="white"
                        style={{ color: 'white', backgroundColor: 'transparent' }}
                    >
                        <Picker.Item label="Selecciona País..." value="" color="#9CA3AF" />
                        {countries.map((c) => (
                            <Picker.Item key={c.code} label={c.name} value={c.code} />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Region */}
            <View>
                <Text className={`${labelColor} mb-1 font-brand-bold`}>Región</Text>
                <View className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <Picker
                        selectedValue={regionId}
                        onValueChange={(itemValue) => handleRegionSelect(itemValue)}
                        enabled={regions.length > 0}
                        dropdownIconColor="white"
                        style={{ color: 'white', backgroundColor: 'transparent' }}
                    >
                        <Picker.Item label="Selecciona Región..." value={0} color="#9CA3AF" />
                        {regions.map((r) => (
                            <Picker.Item key={r.id} label={r.name} value={r.id} />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* City (Comuna) */}
            <View>
                <Text className={`${labelColor} mb-1 font-brand-bold`}>Comuna (Ciudad) *Obligatorio</Text>
                <View className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <Picker
                        selectedValue={cityId}
                        onValueChange={(itemValue) => onCityChange(itemValue)}
                        enabled={cities.length > 0}
                        dropdownIconColor="white"
                        style={{ color: 'white', backgroundColor: 'transparent' }}
                    >
                        <Picker.Item label="Selecciona Comuna..." value={0} color="#9CA3AF" />
                        {cities.map((c) => (
                            <Picker.Item key={c.id} label={c.name} value={c.id} />
                        ))}
                    </Picker>
                </View>
            </View>
        </View>
    );
};

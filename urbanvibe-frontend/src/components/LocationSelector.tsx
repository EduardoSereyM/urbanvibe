import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocations } from '../hooks/useLocations';

interface LocationSelectorProps {
    countryCode?: string;
    regionId?: number;
    cityId?: number;
    onCountryChange: (code: string, name?: string) => void;
    onRegionChange: (id: number, name?: string) => void;
    onCityChange: (id: number, name?: string) => void;
    labelColor?: string;
    pickerContainerClasses?: string; // New Prop for customizing the box style
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    countryCode,
    regionId,
    cityId,
    onCountryChange,
    onRegionChange,
    onCityChange,
    labelColor = "text-white",
    pickerContainerClasses = "bg-surface-deep border border-accent-cyber/20 rounded-xl overflow-hidden" // Default (Cyber/Venue style)
}) => {
    const { countries, regions, cities, loadRegions, loadCities, loading } = useLocations();

    // Initial Data Load (if editing existing)
    useEffect(() => {
        if (countryCode) {
            loadRegions(countryCode);
        }
    }, [countryCode]);

    useEffect(() => {
        if (regionId) {
            loadCities(regionId);
        }
    }, [regionId]);

    const handleCountrySelect = (code: string) => {
        const name = countries.find(c => c.code === code)?.name;
        onCountryChange(code, name);
        loadRegions(code);
    };

    const handleRegionSelect = (id: number) => {
        const name = regions.find(r => r.id === id)?.name;
        onRegionChange(id, name);
        loadCities(id);
    };

    const handleCitySelect = (id: number) => {
        const name = cities.find(c => c.id === id)?.name;
        onCityChange(id, name);
    };

    return (
        <View>
            {/* Country */}
            <View className="mt-4">
                <Text className={`${labelColor} mb-1 font-brand-bold`}>País <Text style={{ color: '#00E0FF' }}>*</Text> {loading && <ActivityIndicator size="small" />}</Text>
                <View className={pickerContainerClasses}>
                    <Picker
                        selectedValue={countryCode}
                        onValueChange={(itemValue) => handleCountrySelect(itemValue)}
                        dropdownIconColor="#989EB3"
                        style={{ color: '#F2F1F0', backgroundColor: 'transparent' }}
                    >
                        <Picker.Item label={countries?.length > 0 ? "Selecciona País" : "Cargando..."} value="" />
                        {countries?.map((c) => (
                            <Picker.Item key={c.code} label={c.name} value={c.code} />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Region */}
            <View className="mt-4">
                <Text className={`${labelColor} mb-1 font-brand-bold`}>Región <Text style={{ color: '#00E0FF' }}>*</Text></Text>
                <View className={pickerContainerClasses}>
                    <Picker
                        selectedValue={regionId}
                        onValueChange={(itemValue) => handleRegionSelect(itemValue)}
                        enabled={regions.length > 0}
                        dropdownIconColor="#989EB3"
                        style={{ color: '#F2F1F0', backgroundColor: 'transparent' }}
                    >
                        <Picker.Item label={loading ? "Cargando..." : "Selecciona Región..."} value={0} />
                        {regions?.map((r) => (
                            <Picker.Item key={r.id} label={r.name} value={r.id} />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* City (Comuna) */}
            <View className="mt-4">
                <Text className={`${labelColor} mb-1 font-brand-bold`}>Comuna <Text style={{ color: '#00E0FF' }}>*</Text></Text>
                <View className={pickerContainerClasses}>
                    <Picker
                        selectedValue={cityId}
                        onValueChange={(itemValue) => handleCitySelect(itemValue)}
                        enabled={cities.length > 0}
                        dropdownIconColor="#989EB3"
                        style={{ color: '#F2F1F0', backgroundColor: 'transparent' }}
                    >
                        <Picker.Item label={loading ? "Cargando..." : "Selecciona Comuna..."} value={0} />
                        {cities?.map((c) => (
                            <Picker.Item key={c.id} label={c.name} value={c.id} />
                        ))}
                    </Picker>
                </View>
            </View>
        </View>

    );
};

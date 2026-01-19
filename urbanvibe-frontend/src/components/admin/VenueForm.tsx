import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { getCoordinatesFromAddress } from '../../utils/geocoding';
import { OpeningHoursEditor } from './OpeningHoursEditor';
import { MultiSelectTag, ProfileEditor } from './AttributeSelectors';
import { useProfile } from '../../hooks/useProfile';
import { Modal } from 'react-native';
import {
    CONNECTIVITY_FEATURES, ACCESSIBILITY_FEATURES, SPACE_FEATURES, COMFORT_FEATURES,
    AUDIENCE_FEATURES, ENTERTAINMENT_FEATURES, DIETARY_OPTIONS, ACCESS_FEATURES,
    SECURITY_FEATURES, MOOD_TAGS, OCCASION_TAGS, MUSIC_GENRES, VOLUME_LEVELS,
    LIVE_MUSIC_FREQUENCY, AGE_FOCUS, CROWD_STYLES, PRICING_USE_CASES, SPEND_BUCKETS
} from '../../constants/venueAttributes';
import { OpeningHoursConfig } from '../../api/types';
import { SelectionModal } from '../ui/SelectionModal';
import { Ionicons } from '@expo/vector-icons';

interface VenueFormProps {
    mode: 'create' | 'edit' | 'view';
    initialData?: any;
    onSubmit?: (data: any) => Promise<void>;
    onCancel: () => void;
    onEdit?: () => void;
    loading?: boolean;
    isOwner?: boolean;
}

interface Option {
    id: number | string;
    label: string;
}

const Accordion = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <View className="mb-4 border border-surface-active rounded-xl overflow-hidden">
            <TouchableOpacity
                onPress={() => setIsOpen(!isOpen)}
                className="flex-row items-center justify-between p-4 bg-surface-deep"
            >
                <Text className="text-foreground font-brand text-base">{title}</Text>
                <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#989EB3" />
            </TouchableOpacity>
            {isOpen && (
                <View className="p-4 border-t border-surface-active bg-surface-deep/50">
                    {children}
                </View>
            )}
        </View>
    );
};

const Card = ({ title, subtitle, children, className }: { title: string, subtitle?: string, children: React.ReactNode, className?: string }) => (
    <View className={`bg-surface-card rounded-xl p-6 mb-8 shadow-sm ${className}`}>
        <View className="mb-6">
            <Text className="text-foreground font-brand text-xl font-semibold">{title}</Text>
            {subtitle && <Text className="text-foreground-muted font-body text-sm mt-1">{subtitle}</Text>}
        </View>
        {children}
    </View>
);

// Field visibility configuration based on the provided image
const FIELD_CONFIG = {
    id: { create: false, edit: false, view: true },
    legal_name: { create: true, edit: true, view: true },
    name: { create: true, edit: true, view: true },
    slug: { create: false, edit: true, view: true }, // Assuming slug is generated on create
    slogan: { create: true, edit: true, view: true },
    overview: { create: true, edit: true, view: true },
    category_id: { create: true, edit: true, view: true },
    logo_url: { create: true, edit: true, view: true },
    cover_image_urls: { create: true, edit: true, view: true },
    location: { create: false, edit: false, view: false }, // Handled via lat/lng
    latitude: { create: true, edit: true, view: true }, // Input manual allowed
    longitude: { create: true, edit: true, view: true }, // Input manual allowed
    geohash: { create: false, edit: false, view: false },
    address_display: { create: true, edit: true, view: true },
    address_street: { create: true, edit: true, view: true },
    address_number: { create: true, edit: true, view: true },
    city: { create: true, edit: true, view: true },
    region_state: { create: true, edit: true, view: true },
    country_code: { create: true, edit: true, view: true },
    timezone: { create: true, edit: true, view: true },
    google_place_id: { create: true, edit: true, view: true },
    directions_tip: { create: true, edit: true, view: true },
    opening_hours: { create: true, edit: true, view: true },
    operational_status: { create: true, edit: true, view: true },
    is_operational: { create: true, edit: true, view: true },
    contact_phone: { create: true, edit: true, view: true },
    contact_email: { create: true, edit: true, view: true },
    website: { create: true, edit: true, view: true },
    price_tier: { create: true, edit: true, view: true },
    avg_price_min: { create: true, edit: true, view: true },
    avg_price_max: { create: true, edit: true, view: true },
    currency_code: { create: true, edit: true, view: true },
    payment_methods: { create: true, edit: true, view: true },
    pricing_profile: { create: true, edit: true, view: true },
    menu_media_urls: { create: true, edit: true, view: true },
    menu_last_updated_at: { create: false, edit: true, view: true },
    mood_tags: { create: true, edit: true, view: true },
    occasion_tags: { create: true, edit: true, view: true },
    music_profile: { create: true, edit: true, view: true },
    crowd_profile: { create: true, edit: true, view: true },
    noise_level: { create: true, edit: true, view: true },

    connectivity_features: { create: true, edit: true, view: true },
    accessibility_features: { create: true, edit: true, view: true },
    space_features: { create: true, edit: true, view: true },
    comfort_features: { create: true, edit: true, view: true },
    audience_features: { create: true, edit: true, view: true },
    entertainment_features: { create: true, edit: true, view: true },
    dietary_options: { create: true, edit: true, view: true },
    access_features: { create: true, edit: true, view: true },
    security_features: { create: true, edit: true, view: true },
    capacity_estimate: { create: true, edit: true, view: true },
    seated_capacity: { create: true, edit: true, view: true },
    standing_allowed: { create: true, edit: true, view: true },
    is_verified: { create: true, edit: true, view: true },
    is_featured: { create: true, edit: true, view: true },
    is_founder_venue: { create: true, edit: true, view: true },
    verification_status: { create: true, edit: true, view: true },
    trust_tier: { create: true, edit: true, view: true },
    verified_visits_all_time: { create: false, edit: false, view: true }, // Read only
    verified_visits_monthly: { create: false, edit: false, view: true }, // Read only
    rating_average: { create: false, edit: false, view: true }, // Read only
    review_count: { create: false, edit: false, view: true }, // Read only
    owner_id: { create: true, edit: true, view: true },
    features_config: { create: true, edit: true, view: true },
    admin_notes: { create: true, edit: true, view: true },
    company_tax_id: { create: true, edit: true, view: true },
    ownership_proof_url: { create: true, edit: true, view: true },
    referral_code: { create: true, edit: true, view: true },
    referred_by_user_id: { create: true, edit: false, view: true },
    referred_by_venue_id: { create: true, edit: false, view: true },
    search_vector: { create: false, edit: false, view: false },
    created_at: { create: false, edit: false, view: true },
    updated_at: { create: false, edit: false, view: true },
    deleted_at: { create: false, edit: false, view: true },
};

const INITIAL_STATE = {
    name: '',
    legal_name: '',
    slogan: '',
    overview: '',
    category_id: null,
    category_label: '',
    logo_uri: '',
    cover_image_uris: [],
    address_street: '',
    address_number: '',
    city: '',
    region_state: '',
    country_code: 'CL',
    directions_tip: '',
    latitude: '',
    longitude: '',
    price_tier: '1',
    avg_price_min: '0',
    avg_price_max: '0',
    currency_code: 'CLP',
    operational_status: 'operational',
    is_verified: false,
    is_featured: false,
    is_founder: false,
    trust_tier: 'standard',
    ownership_proof_uri: '',
    company_tax_id: '',
    opening_hours: {
        timezone: 'America/Santiago',
        regular: [
            { day: 'monday', open: '09:00', close: '18:00', closed: false },
            { day: 'tuesday', open: '09:00', close: '18:00', closed: false },
            { day: 'wednesday', open: '09:00', close: '18:00', closed: false },
            { day: 'thursday', open: '09:00', close: '18:00', closed: false },
            { day: 'friday', open: '09:00', close: '18:00', closed: false },
            { day: 'saturday', closed: true },
            { day: 'sunday', closed: true }
        ],
        exceptions: []
    },
    payment_methods: { cash: true, card: false, transfer: false },

    connectivity_features: [],
    accessibility_features: [],
    space_features: [],
    comfort_features: [],
    audience_features: [],
    entertainment_features: [],
    dietary_options: [],
    access_features: [],
    security_features: [],
    mood_tags: [],
    occasion_tags: [],
    music_profile: {},
    crowd_profile: {},
    pricing_profile: {},
    capacity_estimate: '',
    seated_capacity: '',
    standing_allowed: false,
    noise_level: 'moderate',
    owner_id: '',
    contact: { phone: '', email: '', website: '' },
    features: { has_parking: false, has_wifi: false, accepts_reservations: false, is_pet_friendly: false },
    verification_status: 'pending',
    is_operational: true,
    menu_image_uris: [],
    admin_notes: '',
    referral_code: '',
    website: '',
    contact_email: '',
    contact_phone: '',
};

export function VenueForm({ mode, initialData, onSubmit, onCancel, onEdit, loading: parentLoading, isOwner = false }: VenueFormProps) {
    const [form, setForm] = useState<any>(INITIAL_STATE);
    const [loading, setLoading] = useState(false);
    const [geocodingLoading, setGeocodingLoading] = useState(false);
    const [categories, setCategories] = useState<Option[]>([]);
    const [regions, setRegions] = useState<Option[]>([]);
    const [cities, setCities] = useState<Option[]>([]);
    const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
    const [modalVisible, setModalVisible] = useState<{ type: 'category' | 'region' | 'city' | 'document_preview' | null }>({ type: null });
    const { data: userProfile } = useProfile();
    const isSuperAdmin = userProfile?.roles?.includes('SUPER_ADMIN');

    const isViewMode = mode === 'view';

    const isEditMode = mode === 'edit';
    const isCreateMode = mode === 'create';

    const fetchCategories = async () => {
        const { data, error } = await supabase.from('venue_categories').select('id, name').order('name');
        if (data) setCategories(data.map(c => ({ id: c.id, label: c.name })));
    };

    const fetchRegions = async () => {
        const { data, error } = await supabase.from('regions').select('id, name').eq('country_code', 'CL').order('name');
        if (data) setRegions(data.map(r => ({ id: r.id, label: r.name })));
    };



    const fetchCities = async (regionId: number) => {
        console.log('🏙️ Fetching cities for region ID:', regionId);
        try {
            const { data, error } = await supabase
                .from('cities')
                .select('id, name, region_id')
                .eq('region_id', regionId)
                .order('name');

            if (error) {
                console.error('❌ Error fetching cities:', error);
                Alert.alert('Error', 'No se pudieron cargar las ciudades. ' + error.message);
                return;
            }

            if (data) {
                console.log(`✅ Loaded ${data.length} cities for region ${regionId}`);
                if (data.length === 0) {
                    console.warn('⚠️ No cities found for this region! Check database seeding.');
                }
                setCities(data.map(c => ({ id: c.id, label: c.name })));
            }
        } catch (err) {
            console.error('❌ Exception in fetchCities:', err);
        }
    };

    useEffect(() => {
        if (initialData) {
            // Merge initialData with INITIAL_STATE to ensure all fields exist
            const mergedData = { ...INITIAL_STATE, ...initialData };

            // Map flat fields to nested structures if needed, or vice-versa
            // The initialData from create.tsx and [venueId].tsx might differ slightly
            // We need to normalize it here.

            if (initialData.contact) {
                mergedData.contact_phone = initialData.contact.phone || initialData.contact_phone || '';
                mergedData.contact_email = initialData.contact.email || initialData.contact_email || '';
                mergedData.website = initialData.contact.website || initialData.website || '';
            } else {
                mergedData.contact_phone = initialData.contact_phone || '';
                mergedData.contact_email = initialData.contact_email || '';
                mergedData.website = initialData.website || '';
            }

            if (initialData.address) {
                mergedData.address_street = initialData.address.address_street ?? initialData.address_street ?? '';
                mergedData.address_number = initialData.address.address_number ?? initialData.address_number ?? '';
                mergedData.city = initialData.address.city ?? initialData.city ?? '';
                mergedData.region_state = initialData.address.region_state ?? initialData.address.region ?? initialData.region_state ?? '';
                mergedData.country_code = initialData.address.country_code ?? initialData.country_code ?? 'CL';
                mergedData.latitude = initialData.address.latitude?.toString() ?? initialData.latitude?.toString() ?? '';
                mergedData.longitude = initialData.address.longitude?.toString() ?? initialData.longitude?.toString() ?? '';
                mergedData.directions_tip = initialData.directions_tip ?? initialData.address.directions_tip ?? '';
            }

            if (initialData.metrics) {
                mergedData.verified_visits_all_time = initialData.metrics.total_verified_visits;
                mergedData.verified_visits_monthly = initialData.metrics.verified_visits_this_month;
                mergedData.rating_average = initialData.metrics.rating_average;
                mergedData.review_count = initialData.metrics.total_reviews;
            }

            // Handle images
            if (initialData.logo_url) mergedData.logo_uri = initialData.logo_url;
            if (initialData.cover_image_urls) mergedData.cover_image_uris = initialData.cover_image_urls;
            if (initialData.ownership_proof_url) mergedData.ownership_proof_uri = initialData.ownership_proof_url;
            if (initialData.menu_media_urls) mergedData.menu_image_uris = initialData.menu_media_urls;
            if (initialData.admin_notes) mergedData.admin_notes = initialData.admin_notes;
            if (initialData.referral_code) mergedData.referral_code = initialData.referral_code;
            if (initialData.company_tax_id) mergedData.company_tax_id = initialData.company_tax_id;
            if (initialData.category_id) mergedData.category_id = initialData.category_id;
            if (initialData.features_config) mergedData.features_config = initialData.features_config;

            // Map price and capacity fields
            if (initialData.price_tier) mergedData.price_tier = initialData.price_tier.toString();
            if (initialData.avg_price_min) mergedData.avg_price_min = initialData.avg_price_min.toString();
            if (initialData.avg_price_max) mergedData.avg_price_max = initialData.avg_price_max.toString();
            if (initialData.currency_code) mergedData.currency_code = initialData.currency_code;

            if (initialData.capacity_estimate) mergedData.capacity_estimate = initialData.capacity_estimate.toString();
            if (initialData.seated_capacity) mergedData.seated_capacity = initialData.seated_capacity.toString();
            if (initialData.standing_allowed !== undefined) mergedData.standing_allowed = initialData.standing_allowed;
            if (initialData.noise_level) mergedData.noise_level = initialData.noise_level;

            setForm(mergedData);
        }

        fetchCategories();
        fetchRegions();
    }, [initialData]);

    useEffect(() => {
        if (form.category_id && categories.length > 0) {
            const cat = categories.find(c => c.id === form.category_id);
            if (cat) {
                updateForm('category_label', cat.label);
            }
        }
    }, [form.category_id, categories]);

    // NEW: Sync selectedRegionId if form.region_state exists but selectedRegionId doesn't
    useEffect(() => {
        if (form.region_state && regions.length > 0 && !selectedRegionId) {
            const matchedRegion = regions.find(r => r.label === form.region_state);
            if (matchedRegion) {
                console.log('Syncing Region ID from Name:', matchedRegion.label, '->', matchedRegion.id);
                setSelectedRegionId(matchedRegion.id as number);
            }
        }
    }, [form.region_state, regions, selectedRegionId]);

    useEffect(() => {
        if (selectedRegionId) {
            fetchCities(selectedRegionId);
        } else {
            setCities([]);
        }
    }, [selectedRegionId]);

    const updateForm = (key: string, value: any) => {
        setForm((prev: any) => ({ ...prev, [key]: value }));
    };

    const handlePickImage = async (type: 'logo' | 'cover' | 'document' | 'menu') => {
        if (isViewMode) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            aspect: type === 'logo' ? [1, 1] : type === 'cover' ? [16, 9] : undefined,
            quality: 0.7,
        });

        if (!result.canceled) {
            if (type === 'logo') {
                updateForm('logo_uri', result.assets[0].uri);
            } else if (type === 'cover') {
                updateForm('cover_image_uris', [...form.cover_image_uris, result.assets[0].uri]);
            } else if (type === 'document') {
                updateForm('ownership_proof_uri', result.assets[0].uri);
            } else if (type === 'menu') {
                updateForm('menu_image_uris', [...(form.menu_image_uris || []), result.assets[0].uri]);
            }
        }
    };

    const uploadImage = async (uri: string, folder: string) => {
        try {
            const response = await fetch(uri);
            const arrayBuffer = await response.arrayBuffer();
            const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

            const { data, error } = await supabase.storage
                .from('urbanvibe_media')
                .upload(filename, arrayBuffer, {
                    contentType: 'image/jpeg',
                });

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('urbanvibe_media')
                .getPublicUrl(filename);

            return publicUrlData.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleGeocode = async () => {
        if (!form.address_street || !form.address_number || !form.city) {
            Alert.alert('Faltan datos', 'Ingresa calle, número y ciudad para validar la ubicación.');
            return;
        }

        setGeocodingLoading(true);
        const coords = await getCoordinatesFromAddress(
            form.address_street,
            form.address_number,
            form.city,
            form.region_state,
            form.country_code === 'CL' ? 'Chile' : form.country_code
        );
        setGeocodingLoading(false);

        if (coords) {
            updateForm('latitude', coords.latitude.toString());
            updateForm('longitude', coords.longitude.toString());
            Alert.alert('Ubicación Encontrada', `Lat: ${coords.latitude}, Lng: ${coords.longitude}`);
        } else {
            Alert.alert('Error', 'No pudimos encontrar la dirección. Verifica los datos.');
        }
    };

    const handleSubmit = async () => {
        if (!onSubmit) return;

        setLoading(true);
        try {
            let logoUrl = form.logo_uri;
            let coverUrls = [...form.cover_image_uris];
            let ownershipProofUrl = form.ownership_proof_uri;

            // Upload images if they are local URIs
            if (logoUrl && !logoUrl.startsWith('http')) {
                logoUrl = await uploadImage(logoUrl, 'logos');
            }

            const newCoverUrls = [];
            for (const uri of coverUrls) {
                if (uri && !uri.startsWith('http')) {
                    const url = await uploadImage(uri, 'covers');
                    newCoverUrls.push(url);
                } else {
                    newCoverUrls.push(uri);
                }
            }
            coverUrls = newCoverUrls;

            if (ownershipProofUrl && !ownershipProofUrl.startsWith('http')) {
                ownershipProofUrl = await uploadImage(ownershipProofUrl, 'documents');
            }

            let menuUrls = [...(form.menu_image_uris || [])];
            const newMenuUrls = [];
            for (const uri of menuUrls) {
                if (uri && !uri.startsWith('http')) {
                    const url = await uploadImage(uri, 'menus');
                    newMenuUrls.push(url);
                } else {
                    newMenuUrls.push(uri);
                }
            }
            menuUrls = newMenuUrls;

            // Prepare payload
            const payload = {
                ...form,
                logo_url: logoUrl,
                cover_image_urls: coverUrls,
                ownership_proof_url: ownershipProofUrl,
                menu_media_urls: menuUrls,
                // Ensure numbers are numbers
                price_tier: parseInt(form.price_tier) || 1,
                avg_price_min: parseFloat(form.avg_price_min) || 0,
                avg_price_max: parseFloat(form.avg_price_max) || 0,
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude),
                capacity_estimate: form.capacity_estimate ? parseInt(form.capacity_estimate) : undefined,
                seated_capacity: form.seated_capacity ? parseInt(form.seated_capacity) : undefined,
                // Map back contact and features if needed by backend, 
                // but create.tsx sent flat fields. Let's send flat fields and let the backend/hook handle it?
                // The create.tsx payload construction was quite specific.
                // We should probably replicate that payload construction here or let the parent handle it.
                // Better to return the processed form data and let the parent decide?
                // No, the goal is to unify.

                // Let's construct the standard payload here
                contact: {
                    phone: form.contact_phone,
                    email: form.contact_email,
                    website: form.website,
                },
                company_tax_id: form.company_tax_id,
                category_id: form.category_id,
                // ... other mappings
            };

            // For now, pass the form state + uploaded URLs to the onSubmit callback
            // The callback (in create.tsx or [venueId].tsx) will handle the specific API call structure if needed
            // OR we standardize the API payload.
            // Given the complexity, I'll pass the enriched form data to onSubmit.

            await onSubmit(payload);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const shouldShow = (field: keyof typeof FIELD_CONFIG) => {
        return FIELD_CONFIG[field]?.[mode];
    };

    const isReadOnly = isViewMode;

    const renderInput = (label: string, key: string, placeholder: string, required = false, keyboardType: any = 'default', multiline = false) => {
        // Check visibility
        const configKey = key as keyof typeof FIELD_CONFIG;
        if (!shouldShow(configKey) && !shouldShow(key as any)) return null;

        return (
            <View className="mb-4 flex-1">
                <Text className="text-foreground-muted font-body-semibold mb-2 ml-1 text-xs uppercase tracking-wider">
                    {label} {required && !isViewMode && <Text className="text-primary">*</Text>}
                </Text>
                {isViewMode ? (
                    <View className="bg-surface-deep/50 border border-surface-deep rounded-xl px-4 py-3">
                        <Text className="text-foreground font-body">{form[key] || '-'}</Text>
                    </View>
                ) : (
                    <TextInput
                        className={`bg-surface-deep border border-accent-cyber/20 rounded-xl px-4 py-3 text-foreground font-body ${multiline ? 'h-32' : ''} focus:border-accent-cyber focus:shadow-lg`}
                        placeholder={placeholder}
                        placeholderTextColor="#989EB3"
                        value={form[key] as string}
                        onChangeText={(text) => updateForm(key, text)}
                        keyboardType={keyboardType}
                        multiline={multiline}
                        textAlignVertical={multiline ? 'top' : 'center'}
                        editable={!isViewMode}
                    />
                )}
            </View>
        );
    };

    const renderSelector = (label: string, value: string, placeholder: string, onPress: () => void, required = false, configKey?: string) => {
        if (configKey && !shouldShow(configKey as any)) return null;

        return (
            <View className="mb-4 flex-1">
                <Text className="text-foreground-muted font-body-semibold mb-2 ml-1 text-xs uppercase tracking-wider">
                    {label} {required && !isViewMode && <Text className="text-primary">*</Text>}
                </Text>
                {isViewMode ? (
                    <View className="bg-surface-deep/50 border border-surface-deep rounded-xl px-4 py-3">
                        <Text className="text-foreground font-body">{value || '-'}</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={onPress}
                        className="bg-surface-deep border border-accent-cyber/20 rounded-xl px-4 py-3"
                    >
                        <Text className={`font-body ${value ? 'text-foreground' : 'text-foreground-muted'}`}>
                            {value || placeholder}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const MetricRow = ({ label, value, icon }: { label: string, value: string | number, icon: string }) => (
        <View className="flex-row items-center justify-between py-3 border-b border-surface-active/50 last:border-0">
            <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-surface-active items-center justify-center">
                    <Ionicons name={icon as any} size={16} color="#00E0FF" />
                </View>
                <Text className="text-foreground-muted font-body">{label}</Text>
            </View>
            <Text className="text-foreground font-brand text-lg">{value}</Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Sticky Header */}
            <View className="px-6 py-4 border-b border-surface-active bg-background/95 absolute top-0 left-0 right-0 z-50 pt-12">
                <View className="flex-col gap-3">
                    <View>
                        <Text className="text-foreground font-brand text-2xl" numberOfLines={1} ellipsizeMode="tail">
                            {mode === 'create' ? 'Nuevo Local' : form.name || 'Editar Local'}
                        </Text>
                        <Text className="text-foreground-muted text-xs uppercase tracking-wider">
                            {mode === 'create' ? 'Crear' : mode === 'edit' ? 'Edición' : 'Vista Previa'}
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between gap-3 border-t border-surface-active/30 pt-3">
                        <TouchableOpacity onPress={onCancel} className="px-4 py-2">
                            <Text className="text-foreground-muted font-brand text-base">
                                {isViewMode ? 'Volver' : 'Cancelar'}
                            </Text>
                        </TouchableOpacity>
                        {isViewMode && onEdit && (
                            <TouchableOpacity onPress={onEdit} className="px-4 py-2 bg-surface-active rounded-full">
                                <Text className="text-accent-turquesa font-brand text-base">Editar</Text>
                            </TouchableOpacity>
                        )}
                        {!isViewMode && (
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={loading}
                                className="bg-primary px-6 py-2 rounded-full shadow-sm shadow-accent-cyber/50"
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text className="text-white font-brand font-bold text-base">Guardar</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 mt-40">
                <ScrollView className="flex-1 px-4 py-6" contentContainerStyle={{ paddingBottom: 100 }}>

                    {/* CARD 1: IDENTIDAD */}
                    <Card title="Identidad del Local" subtitle="Información esencial de tu marca">
                        {renderInput('Nombre del Local', 'name', 'Ej: Bar La Playa', true)}
                        {/* Legal Name - Locked for Owners ONLY on Edit */}
                        {isOwner && mode !== 'create' ? (
                            <View className="mb-4 flex-1">
                                <Text className="text-foreground-muted font-body-semibold mb-2 ml-1 text-xs uppercase tracking-wider">Razón Social</Text>
                                <View className="bg-surface-deep/50 border border-surface-deep rounded-xl px-4 py-3 flex-row justify-between items-center">
                                    <Text className="text-foreground font-body">{form.legal_name || '-'}</Text>
                                    <Ionicons name="lock-closed" size={16} color="#666" />
                                </View>
                            </View>
                        ) : (
                            renderInput('Razón Social', 'legal_name', 'Ej: Inversiones Playa SpA')
                        )}
                        {renderInput('Slogan', 'slogan', 'Una frase que te defina')}
                        {renderInput('Descripción', 'overview', 'Cuenta la historia de tu local...', false, 'default', true)}
                        {renderSelector('Categoría', form.category_label, 'Seleccionar Categoría', () => setModalVisible({ type: 'category' }), true, 'category_id')}
                    </Card>

                    {/* CARD 2: CONTACTO */}
                    <Card title="Contacto" subtitle="Canales de comunicación pública">
                        <View className="flex-row gap-4">
                            {renderInput('Teléfono', 'contact_phone', '+56 9 ...', false, 'phone-pad')}
                        </View>
                        <View className="flex-row gap-4">
                            {renderInput('Email', 'contact_email', 'contacto@local.cl', false, 'email-address')}
                        </View>
                        <View className="flex-row gap-4">
                            {renderInput('Sitio Web', 'website', 'https://...')}
                        </View>
                    </Card>

                    {/* CARD 3: MULTIMEDIA */}
                    <Card title="Galería & Menú" subtitle="Imágenes que venden la experiencia">
                        <View className="bg-surface-deep rounded-xl p-4 border border-surface-active mb-6">
                            <Text className="text-foreground-muted font-body-semibold mb-3 ml-1 text-xs uppercase tracking-wider">Logo</Text>
                            <TouchableOpacity onPress={() => handlePickImage('logo')} className="items-center justify-center bg-surface border border-dashed border-accent-cyber/30 rounded-full h-32 w-32 self-center overflow-hidden relative">
                                {form.logo_uri ? (
                                    <Image source={{ uri: form.logo_uri }} className="w-full h-full" resizeMode="cover" />
                                ) : (
                                    <View className="items-center">
                                        <Ionicons name="camera" size={24} color="#00E0FF" />
                                        <Text className="text-accent-cyber text-xs mt-2">Subir Logo</Text>
                                    </View>
                                )}
                                {!isViewMode && form.logo_uri && (
                                    <View className="absolute inset-0 bg-black/30 items-center justify-center opacity-0 hover:opacity-100">
                                        <Ionicons name="pencil" size={20} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                            {!isViewMode && form.logo_uri && (
                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.alert(
                                            'Eliminar Logo',
                                            '¿Estás seguro de que quieres eliminar el logo?',
                                            [
                                                { text: 'Cancelar', style: 'cancel' },
                                                {
                                                    text: 'Eliminar',
                                                    style: 'destructive',
                                                    onPress: () => updateForm('logo_uri', '')
                                                }
                                            ]
                                        );
                                    }}
                                    className="absolute top-4 right-4 bg-surface-deep rounded-full p-2 border border-surface-active shadow-sm"
                                >
                                    <Ionicons name="trash" size={16} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className="bg-surface-deep rounded-xl p-4 border border-surface-active mb-6">
                            <Text className="text-foreground-muted font-body-semibold mb-3 ml-1 text-xs uppercase tracking-wider">Portada</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                                <TouchableOpacity onPress={() => handlePickImage('cover')} className="mr-3 items-center justify-center bg-surface border border-dashed border-accent-cyber/30 rounded-xl h-32 w-48 shadow-sm hover:shadow-accent-cyber/50">
                                    <View className="bg-primary rounded-full w-10 h-10 items-center justify-center shadow-lg shadow-primary/50">
                                        <Ionicons name="add" size={24} color="white" />
                                    </View>
                                    <Text className="text-foreground-muted text-xs mt-2">Agregar Foto</Text>
                                </TouchableOpacity>
                                {form.cover_image_uris.map((uri: string, index: number) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => {
                                            if (!isViewMode) {
                                                Alert.alert(
                                                    'Eliminar Imagen',
                                                    '¿Estás seguro de que quieres eliminar esta imagen?',
                                                    [
                                                        { text: 'Cancelar', style: 'cancel' },
                                                        {
                                                            text: 'Eliminar',
                                                            style: 'destructive',
                                                            onPress: () => updateForm('cover_image_uris', form.cover_image_uris.filter((_: any, i: number) => i !== index))
                                                        }
                                                    ]
                                                );
                                            }
                                        }}
                                        className="mr-3 relative h-32 w-48 rounded-xl overflow-hidden border border-accent-cyber/20 shadow-sm"
                                    >
                                        <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                                        {!isViewMode && (
                                            <View className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 backdrop-blur-sm">
                                                <Ionicons name="trash" size={14} color="#EF4444" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View className="bg-surface-deep rounded-xl p-4 border border-surface-active">
                            <Text className="text-foreground-muted font-body-semibold mb-3 ml-1 text-xs uppercase tracking-wider">Carta / Menú Digital</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <TouchableOpacity onPress={() => handlePickImage('menu')} className="mr-3 items-center justify-center bg-surface border border-dashed border-accent-cyber/30 rounded-xl h-40 w-28">
                                    <Ionicons name="restaurant" size={24} color="#00E0FF" />
                                    <Text className="text-accent-cyber text-xs mt-2 text-center px-2">Agregar Página</Text>
                                </TouchableOpacity>
                                {(form.menu_image_uris || []).map((uri: string, index: number) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => {
                                            if (!isViewMode) {
                                                Alert.alert(
                                                    'Eliminar Imagen',
                                                    '¿Estás seguro de que quieres eliminar esta imagen?',
                                                    [
                                                        { text: 'Cancelar', style: 'cancel' },
                                                        {
                                                            text: 'Eliminar',
                                                            style: 'destructive',
                                                            onPress: () => updateForm('menu_image_uris', form.menu_image_uris.filter((_: any, i: number) => i !== index))
                                                        }
                                                    ]
                                                );
                                            }
                                        }}
                                        className="mr-3 relative h-40 w-28 rounded-xl overflow-hidden border border-accent-cyber/20"
                                    >
                                        <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                                        {!isViewMode && (
                                            <View className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 backdrop-blur-sm">
                                                <Ionicons name="trash" size={14} color="#EF4444" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </Card>

                    {/* CARD 4: UBICACIÓN */}
                    <Card title="Ubicación" subtitle="Dónde encontrarte">
                        {renderInput('Calle', 'address_street', 'Av. Providencia', true)}
                        <View className="flex-row gap-4">
                            {renderInput('Número', 'address_number', '1234', true)}
                        </View>
                        <View className="flex-row gap-4">
                            {renderSelector('Región', form.region_state, 'Seleccionar', () => setModalVisible({ type: 'region' }), true, 'region_state')}
                            {renderSelector(
                                'Comuna',
                                form.city,
                                form.region_state ? 'Seleccionar' : 'Selecciona Región primero',
                                () => {
                                    if (!form.region_state) {
                                        Alert.alert('Atención', 'Debes seleccionar una región antes de elegir la comuna.');
                                        return;
                                    }
                                    setModalVisible({ type: 'city' });
                                },
                                true,
                                'city'
                            )}
                        </View>

                        {renderInput('Tip de Dirección', 'directions_tip', 'Ej: Entrada por el estacionamiento...', false, 'default', true)}

                        <View className="mt-2 mb-4">
                            <TouchableOpacity
                                onPress={handleGeocode}
                                disabled={geocodingLoading || isViewMode}
                                className={`flex-row items-center justify-center py-3 rounded-xl border ${isViewMode ? 'border-surface-active' : 'border-accent-turquesa bg-accent-turquesa/10'}`}
                            >
                                {geocodingLoading ? (
                                    <ActivityIndicator color="#00F5D4" />
                                ) : (
                                    <>
                                        <Ionicons name="map" size={20} color={isViewMode ? '#989EB3' : '#00F5D4'} />
                                        <Text className={`ml-2 font-brand ${isViewMode ? 'text-foreground-muted' : 'text-accent-turquesa'}`}>
                                            {form.latitude ? 'Actualizar Coordenadas' : 'Buscar en Mapa'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {form.latitude && (
                            <View className="flex-row justify-between bg-surface-deep rounded-lg p-3 border border-surface-active">
                                <Text className="text-foreground-muted text-xs font-mono">Lat: {form.latitude}</Text>
                                <Text className="text-foreground-muted text-xs font-mono">Lng: {form.longitude}</Text>
                            </View>
                        )}
                    </Card>

                    {/* CARD 5: HORARIOS */}
                    <Card title="Horarios" subtitle="Cuándo encontrarte">
                        <OpeningHoursEditor
                            value={form.opening_hours}
                            onChange={(val) => updateForm('opening_hours', val)}
                            readOnly={isViewMode}
                        />
                    </Card>

                    {/* CARD 6: ATRIBUTOS */}
                    <Card title="Atributos" subtitle="Comodidades y servicios">
                        <Accordion title="INFRAESTRUCTURA" defaultOpen={true}>
                            <MultiSelectTag
                                label="Conectividad"
                                options={CONNECTIVITY_FEATURES}
                                selected={form.connectivity_features || []}
                                onChange={(val) => updateForm('connectivity_features', val)}
                                disabled={isViewMode}
                            />
                            <MultiSelectTag
                                label="Accesibilidad"
                                options={ACCESSIBILITY_FEATURES}
                                selected={form.accessibility_features || []}
                                onChange={(val) => updateForm('accessibility_features', val)}
                                disabled={isViewMode}
                            />
                            <MultiSelectTag
                                label="Espacio"
                                options={SPACE_FEATURES}
                                selected={form.space_features || []}
                                onChange={(val) => updateForm('space_features', val)}
                                disabled={isViewMode}
                            />
                            <MultiSelectTag
                                label="Confort"
                                options={COMFORT_FEATURES}
                                selected={form.comfort_features || []}
                                onChange={(val) => updateForm('comfort_features', val)}
                                disabled={isViewMode}
                            />
                            <MultiSelectTag
                                label="Seguridad"
                                options={SECURITY_FEATURES}
                                selected={form.security_features || []}
                                onChange={(val) => updateForm('security_features', val)}
                                disabled={isViewMode}
                            />
                            <MultiSelectTag
                                label="Acceso Vehicular"
                                options={ACCESS_FEATURES}
                                selected={form.access_features || []}
                                onChange={(val) => updateForm('access_features', val)}
                                disabled={isViewMode}
                            />
                        </Accordion>

                        <Accordion title="EXPERIENCIA" defaultOpen={false}>
                            <MultiSelectTag
                                label="Entretenimiento"
                                options={ENTERTAINMENT_FEATURES}
                                selected={form.entertainment_features || []}
                                onChange={(val) => updateForm('entertainment_features', val)}
                                disabled={isViewMode}
                            />
                            <MultiSelectTag
                                label="Público"
                                options={AUDIENCE_FEATURES}
                                selected={form.audience_features || []}
                                onChange={(val) => updateForm('audience_features', val)}
                                disabled={isViewMode}
                            />
                            <MultiSelectTag
                                label="Opciones Dietéticas"
                                options={DIETARY_OPTIONS}
                                selected={form.dietary_options || []}
                                onChange={(val) => updateForm('dietary_options', val)}
                                disabled={isViewMode}
                            />
                            <MultiSelectTag
                                label="Vibe / Mood"
                                options={MOOD_TAGS}
                                selected={form.mood_tags || []}
                                onChange={(val) => updateForm('mood_tags', val)}
                                disabled={isViewMode}
                            />
                            <MultiSelectTag
                                label="Ocasiones"
                                options={OCCASION_TAGS}
                                selected={form.occasion_tags || []}
                                onChange={(val) => updateForm('occasion_tags', val)}
                                disabled={isViewMode}
                            />
                        </Accordion>
                    </Card>

                    {/* CARD 7: PRECIO Y CAPACIDAD */}
                    <Card title="Precio y Capacidad" subtitle="Detalles operativos">
                        <Text className="text-foreground-muted font-body-semibold my-2 ml-1 text-xs uppercase tracking-wider">Nivel de Precio</Text>
                        <View className="flex-row gap-2 mb-4">
                            {[1, 2, 3, 4].map((tier) => (
                                <TouchableOpacity
                                    key={tier}
                                    onPress={() => !isViewMode && updateForm('price_tier', tier.toString())}
                                    activeOpacity={isViewMode ? 1 : 0.7}
                                    className={`flex-1 py-3 rounded-xl border items-center ${form.price_tier == tier.toString()
                                        ? 'bg-primary border-primary'
                                        : 'bg-surface-deep border-accent-cyber/20'
                                        }`}
                                >
                                    <Text className={`font-brand font-bold text-lg ${form.price_tier == tier.toString() ? 'text-white' : 'text-foreground-muted'
                                        }`}>
                                        {'$'.repeat(tier)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text className="text-foreground-muted font-body-semibold my-2 ml-1 text-xs uppercase tracking-wider">Rango de Precios (Estimado)</Text>
                        <View className="flex-row gap-4">
                            {renderInput('Min ($)', 'avg_price_min', '0', false, 'numeric')}
                            {renderInput('Max ($)', 'avg_price_max', '0', false, 'numeric')}
                        </View>
                        <Text className="text-foreground-muted font-body-semibold my-2 ml-1 text-xs uppercase tracking-wider">Capacidad:</Text>
                        <View className="flex-row gap-4">
                            {renderInput('Total', 'capacity_estimate', 'Ej: 100', false, 'numeric')}
                            {renderInput('Sentados', 'seated_capacity', 'Ej: 50', false, 'numeric')}
                        </View>
                        <View className="flex-row items-center justify-between py-3 border-b border-surface-active mb-4">
                            <Text className="text-foreground font-body">¿Permite estar de pie?</Text>
                            <Switch
                                value={form.standing_allowed}
                                onValueChange={(val) => updateForm('standing_allowed', val)}
                                trackColor={{ false: '#252A4A', true: '#083D77' }}
                                thumbColor={form.standing_allowed ? '#00E0FF' : '#989EB3'}
                                disabled={isViewMode}
                            />
                        </View>

                        <Text className="text-foreground font-body-semibold my-2 ml-1 text-xs uppercase tracking-wider">Métodos de Pago</Text>
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            {['Efectivo', 'Tarjeta', 'Transferencia'].map((method) => {
                                const key = method === 'Efectivo' ? 'cash' : method === 'Tarjeta' ? 'card' : 'transfer';
                                const isActive = form.payment_methods?.[key];
                                return (
                                    <TouchableOpacity
                                        key={key}
                                        onPress={() => updateForm('payment_methods', { ...form.payment_methods, [key]: !isActive })}
                                        disabled={isViewMode}
                                        className={`px-4 py-2 rounded-full border ${isActive ? 'bg-primary border-transparent' : 'bg-surface-deep border-accent-cyber/30'}`}
                                    >
                                        <Text className={`text-xs font-body ${isActive ? 'text-white font-bold' : 'text-foreground-muted'}`}>{method}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </Card>

                    {/* CARD 8: ADMINISTRACIÓN */}
                    <Card title="Administración" subtitle="Datos internos">
                        {/* Admin Notes - Hidden for Owners */}
                        {(!isOwner || isSuperAdmin) && renderInput('Notas Admin', 'admin_notes', 'Notas internas...', false, 'default', true)}

                        {/* Tax ID - Read-only for Owners */}
                        {isOwner ? (
                            <View className="mb-4 flex-1">
                                <Text className="text-foreground-muted font-body-semibold mb-2 ml-1 text-xs uppercase tracking-wider">ID Tributario</Text>
                                <View className="bg-surface-deep/50 border border-surface-deep rounded-xl px-4 py-3 flex-row justify-between items-center">
                                    <Text className="text-foreground font-body">{form.company_tax_id || '-'}</Text>
                                    <Ionicons name="lock-closed" size={16} color="#666" />
                                </View>
                            </View>
                        ) : (
                            renderInput('ID Tributario', 'company_tax_id', '76.xxx.xxx-x')
                        )}

                        <Text className="text-foreground-muted font-body-semibold mb-2 ml-1 text-xs uppercase tracking-wider">Documento de Propiedad</Text>
                        <View className="flex-row items-center gap-2 mb-4">
                            <TouchableOpacity
                                onPress={() => !isOwner && handlePickImage('document')}
                                disabled={isOwner}
                                className={`flex-1 flex-row items-center bg-surface-deep border border-accent-cyber/20 rounded-xl px-4 py-3 ${isOwner ? 'opacity-50' : ''}`}
                            >
                                <Ionicons name="document-text" size={24} color="#00E0FF" />
                                <Text className="text-foreground ml-3 flex-1" numberOfLines={1}>
                                    {form.ownership_proof_uri ? 'Documento cargado' : 'Subir documento'}
                                </Text>
                                <Ionicons name="cloud-upload" size={20} color="#989EB3" />
                            </TouchableOpacity>

                            {form.ownership_proof_uri && (
                                <>
                                    <TouchableOpacity
                                        onPress={() => setModalVisible({ type: 'document_preview' })}
                                        className="bg-surface-active p-3 rounded-xl border border-surface-active"
                                    >
                                        <Ionicons name="eye" size={20} color="#00E0FF" />
                                    </TouchableOpacity>

                                    {!isViewMode && isSuperAdmin && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                Alert.alert(
                                                    'Eliminar Documento',
                                                    '¿Estás seguro? Esta acción solo está permitida para Super Admins.',
                                                    [
                                                        { text: 'Cancelar', style: 'cancel' },
                                                        {
                                                            text: 'Eliminar',
                                                            style: 'destructive',
                                                            onPress: () => updateForm('ownership_proof_uri', '')
                                                        }
                                                    ]
                                                );
                                            }}
                                            className="bg-surface-active p-3 rounded-xl border border-surface-active"
                                        >
                                            <Ionicons name="trash" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                        </View>

                        {isSuperAdmin && (
                            <View className="flex-row items-center justify-between py-3 border-t border-surface-active mt-2">
                                <Text className="text-foreground font-body">Verificado (Check Azul)</Text>
                                <Switch
                                    value={form.is_verified}
                                    onValueChange={(val) => updateForm('is_verified', val)}
                                    trackColor={{ false: '#252A4A', true: '#00E0FF' }}
                                    thumbColor={form.is_verified ? '#FFFFFF' : '#989EB3'}
                                    disabled={isViewMode}
                                />
                            </View>
                        )}

                        <View className="flex-row items-center justify-between py-3 border-t border-surface-active mt-2">
                            <Text className="text-foreground font-body">Estado Operacional</Text>
                            <View className="flex-row items-center gap-2">
                                <Text className={`text-xs ${form.is_operational ? 'text-success' : 'text-error'}`}>
                                    {form.is_operational ? 'HABILITADO' : 'DESHABILITADO'}
                                </Text>
                                <Switch
                                    value={form.is_operational}
                                    onValueChange={(val) => updateForm('is_operational', val)}
                                    trackColor={{ false: '#252A4A', true: '#06D6A0' }}
                                    thumbColor={form.is_operational ? '#FFFFFF' : '#989EB3'}
                                    disabled={isViewMode}
                                />
                            </View>
                        </View>
                    </Card>

                    {/* CARD 9: MÉTRICAS (Solo lectura) */}
                    {isViewMode && (
                        <View className="bg-surface-deep rounded-xl p-6 mb-8 shadow-sm border border-surface-active">
                            <View className="mb-6 flex-row items-center gap-2">
                                <Ionicons name="stats-chart" size={24} color="#F2F1F0" />
                                <Text className="text-foreground font-brand text-xl font-semibold">Métricas</Text>
                            </View>
                            <MetricRow label="Visitas Totales" value={form.verified_visits_all_time || 0} icon="people" />
                            <MetricRow label="Visitas Mensuales" value={form.verified_visits_monthly || 0} icon="calendar" />
                            <MetricRow label="Calificación" value={`${form.rating_average || 0} ★`} icon="star" />
                            <MetricRow label="Reseñas" value={form.review_count || 0} icon="chatbubbles" />
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>

            <SelectionModal
                visible={modalVisible.type === 'category'}
                onClose={() => setModalVisible({ type: null })}
                title="Seleccionar Categoría"
                options={categories}
                onSelect={(opt) => {
                    updateForm('category_id', opt.id);
                    updateForm('category_label', opt.label);
                    setModalVisible({ type: null });
                }}
            />

            <SelectionModal
                visible={modalVisible.type === 'region'}
                onClose={() => setModalVisible({ type: null })}
                title="Seleccionar Región"
                options={regions}
                onSelect={(opt) => {
                    updateForm('region_state', opt.label);
                    setSelectedRegionId(opt.id as number);
                    setModalVisible({ type: null });
                }}
            />

            <SelectionModal
                visible={modalVisible.type === 'city'}
                onClose={() => setModalVisible({ type: null })}
                title="Seleccionar Ciudad"
                options={cities}
                onSelect={(opt) => {
                    updateForm('city', opt.label);
                    setModalVisible({ type: null });
                }}
            />

            <Modal
                visible={modalVisible.type === 'document_preview'}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible({ type: null })}
            >
                <View className="flex-1 bg-black/90 items-center justify-center p-4">
                    <TouchableOpacity
                        onPress={() => setModalVisible({ type: null })}
                        className="absolute top-12 right-6 z-50 bg-surface-deep rounded-full p-2"
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>

                    {form.ownership_proof_uri ? (
                        <Image
                            source={{ uri: form.ownership_proof_uri }}
                            className="w-full h-4/5 rounded-xl"
                            resizeMode="contain"
                        />
                    ) : (
                        <View className="bg-surface p-6 rounded-xl">
                            <Text className="text-foreground">No hay documento para previsualizar</Text>
                        </View>
                    )}
                </View>
            </Modal>
        </SafeAreaView >
    );
}

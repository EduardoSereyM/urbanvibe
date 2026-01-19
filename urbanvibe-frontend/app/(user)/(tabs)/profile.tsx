// app/(user)/(tabs)/profile.tsx
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileContext } from '../../../src/hooks/useProfileContext';
import { supabase } from '../../../src/lib/supabase';
import QRScannerModal from '../../../src/components/QRScannerModal';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from '../../../src/api/client';

import { decode } from 'base64-arraybuffer';

const CUISINES_LIST = ['Italiana', 'Japonesa', 'Mexicana', 'China', 'Hamburguesas', 'Pizza', 'Saludable', 'Postres', 'Café', 'Bar', 'Peruana', 'Chilena'];
const PRICE_TIERS = [
  { value: 1, label: '$' },
  { value: 2, label: '$$' },
  { value: 3, label: '$$$' },
  { value: 4, label: '$$$$' },
];

// Helper para formatear fecha de YYYY-MM-DD a DD/MM/YYYY
const formatDateToDDMMYYYY = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    // parts[0] = YYYY, parts[1] = MM, parts[2] = DD
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString; // Retornar original si no se puede formatear
};

export default function ProfileScreen() {
  const router = useRouter();

  // BFF Hook: One call for everything
  const { data, isLoading, isError, refetch } = useProfileContext();

  const profile = data?.profile;
  const checkins = data?.recent_checkins || [];
  const walletSummary = data?.wallet_summary;
  const earnedBadges = data?.earned_badges || [];
  const activeChallenges = data?.active_challenges || [];
  const referral_code = data?.referral_code;
  const ambassador_status = data?.ambassador_status;

  const [scannerVisible, setScannerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  // ... (skip down to UI insertion)

  // To avoid replacing the whole file, I will do this in chunks in my actual tool call strategies if I were splitting. But here I will replace the component body parts.

  // Actually, I can use a simpler replacement for the variable declarations first, then another for the UI.
  // But the tool only allows ONE replace_file_content per turn for contiguous edits.
  // This usage is tricky. I should use `multi_replace_file_content`.

  // Let's use multi_replace.


  // EDIT STATE - Moved here to prevent Hook Order Error
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');

  // const [editWebsite, setEditWebsite] = useState(''); // Removed per user request
  const [editNationalId, setEditNationalId] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editIsInfluencer, setEditIsInfluencer] = useState(false);
  const [editFavoriteCuisines, setEditFavoriteCuisines] = useState<string[]>([]);
  const [editPricePreference, setEditPricePreference] = useState<number>(0);
  const [showCuisinesHelper, setShowCuisinesHelper] = useState(false); // Dropdown State

  // RUT Validation Helper
  const validarRut = (rutCompleto: string) => {
    rutCompleto = rutCompleto.replace(/[\.\-\s]/g, "").toUpperCase();
    if (!/^[0-9]+[0-9K]{1}$/.test(rutCompleto)) return false;
    var rut = rutCompleto.slice(0, -1);
    var dv = rutCompleto.slice(-1);
    var suma = 0;
    var multiplicador = 2;
    for (var i = rut.length - 1; i >= 0; i--) {
      suma += parseInt(rut.charAt(i)) * multiplicador;
      multiplicador++;
      if (multiplicador > 7) multiplicador = 2;
    }
    var dvCalculado: any = 11 - (suma % 11);
    if (dvCalculado === 11) dvCalculado = '0';
    else if (dvCalculado === 10) dvCalculado = 'K';
    else dvCalculado = dvCalculado.toString();
    return dvCalculado === dv;
  }

  const formatRut = (rut: string) => {
    // Simple format 12.345.678-9
    const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length < 2) return clean;
    const dv = clean.slice(-1);
    const body = clean.slice(0, -1);
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedBody}-${dv}`;
  };

  const handleRutChange = (text: string) => {
    // Solo permitir caracteres válidos para operación manual, pero sin formatear
    const clean = text.replace(/[^0-9kK\-\.]/g, '').toUpperCase();
    setEditNationalId(clean);
  };

  const handleRutBlur = () => {
    if (!editNationalId) return;

    // 1. Limpiar
    const clean = editNationalId.replace(/[\.\-\s]/g, "").toUpperCase();

    // 2. Validar
    if (!validarRut(clean)) {
      Alert.alert('RUT Inválido', 'Por favor ingresa un RUT válido.');
      return;
    }

    // 3. Formatear si es válido
    if (clean.length > 1) {
      const dv = clean.slice(-1);
      const body = clean.slice(0, -1);
      const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      setEditNationalId(`${formattedBody}-${dv}`);
    }
  };


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadAvatar(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!profile?.id) return;
    setUploading(true);

    try {
      const base64 = asset.base64;
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `Avatar_user/${profile.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      if (!base64) {
        throw new Error('No se pudo obtener la imagen en base64');
      }

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('urbanvibe_media')
        .upload(filePath, decode(base64), {
          contentType: asset.mimeType ?? 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get Public URL
      const { data } = supabase.storage.from('urbanvibe_media').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 3. Update Backend
      await updateProfile({ avatar_url: publicUrl });

      // 4. Update UI
      await refetch();
      Alert.alert('Éxito', 'Foto de perfil actualizada correctamente.');

    } catch (error: any) {
      console.error('Upload Error:', error);
      Alert.alert('Error', 'No se pudo subir la imagen: ' + (error.message || 'Error desconocido'));
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            if (router.canDismiss()) {
              router.dismissAll();
            }
            router.replace('/');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#FA4E35" />
        <Text className="mt-3 text-foreground font-body">Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-foreground text-center font-body">
          Hubo un problema al cargar tu perfil.
        </Text>
      </SafeAreaView>
    );
  }

  const displayName = profile.username || profile.email?.split('@')[0] || 'Explorador';



  const handleStartEditing = () => {
    setEditFullName(profile?.full_name || '');
    setEditBio(profile?.bio || '');
    setEditFullName(profile?.full_name || '');
    setEditBio(profile?.bio || '');
    // setEditWebsite(profile?.website || '');
    setEditNationalId(profile?.national_id || '');
    setEditBirthDate(profile?.birth_date || ''); // Expecting YYYY-MM-DD
    setEditGender(profile?.gender || '');
    setEditIsInfluencer(profile?.is_influencer || false);
    setEditFavoriteCuisines(profile?.favorite_cuisines || []);
    setEditPricePreference(profile?.price_preference || 1);
    setIsEditing(true);
  };

  const handleDateBlur = () => {
    // Limpiar input y dejar solo números
    const cleanCallback = (text: string) => text.replace(/[^0-9]/g, '');
    const cleanDate = cleanCallback(editBirthDate);

    // Si tiene 8 dígitos (DDMMAAAA), formatear
    if (cleanDate.length === 8) {
      const day = cleanDate.slice(0, 2);
      const month = cleanDate.slice(2, 4);
      const year = cleanDate.slice(4, 8);

      // Validación básica de días y meses
      const numDay = parseInt(day);
      const numMonth = parseInt(month);

      if (numDay > 0 && numDay <= 31 && numMonth > 0 && numMonth <= 12) {
        setEditBirthDate(`${day}/${month}/${year}`);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!profile?.id) return;

    // Convertir DD/MM/AAAA a YYYY-MM-DD para el backend
    let formattedBirthDate = editBirthDate;
    if (editBirthDate && editBirthDate.includes('/')) {
      const parts = editBirthDate.split('/');
      if (parts.length === 3) {
        // parts[0] = DD, parts[1] = MM, parts[2] = AAAA
        // Backend espera YYYY-MM-DD
        formattedBirthDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    } else if (editBirthDate && editBirthDate.length === 8 && /^\d+$/.test(editBirthDate)) {
      // Caso borde: si el usuario no hizo blur pero escribió 8 digitos
      const day = editBirthDate.slice(0, 2);
      const month = editBirthDate.slice(2, 4);
      const year = editBirthDate.slice(4, 8);
      formattedBirthDate = `${year}-${month}-${day}`;
    }

    setUploading(true);
    try {
      await updateProfile({
        full_name: editFullName,
        bio: editBio,
        // website: editWebsite,
        national_id: editNationalId,
        birth_date: formattedBirthDate, // Send ISO format
        gender: editGender,

        is_influencer: editIsInfluencer,
        favorite_cuisines: editFavoriteCuisines,
        price_preference: editPricePreference,
      });
      await refetch();
      setIsEditing(false);
      Alert.alert('Perfil Actualizado', 'Tus datos se guardaron correctamente.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FA4E35" />
        }
      >
        <View className="items-center mb-8">
          <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
            <View className="relative">
              {profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  className="w-28 h-28 rounded-full"
                />
              ) : (
                <View className="w-28 h-28 rounded-full bg-surface-active items-center justify-center">
                  <Text className="text-primary font-brand text-4xl">
                    {displayName[0]?.toUpperCase() ?? 'U'}
                  </Text>
                </View>
              )}

              {uploading ? (
                <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                  <ActivityIndicator color="#FA4E35" />
                </View>
              ) : (
                <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-2 border-background">
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <Text className="font-brand text-2xl text-foreground mt-4 text-center">
            {displayName}
          </Text>

          {/* Level Badge - Gamification */}
          {profile.current_level_name ? (
            <View className="mt-1 mb-4 flex-row items-center gap-2">
              <View className="px-3 py-1 bg-primary/20 rounded-full border border-primary/50">
                <Text className="font-brand text-sm text-primary uppercase">
                  ⭐ {profile.current_level_name}
                </Text>
              </View>
              {/* Show Role only if special (not APP_USER) */}
              {profile.role_name && profile.role_name !== 'APP_USER' && (
                <View className="px-2 py-1 bg-surface-active rounded border border-border">
                  <Text className="font-body text-[10px] text-foreground-muted uppercase">
                    {profile.role_name.replace('_', ' ')}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            /* Fallback to Role if no level (or basic user) */
            profile.role_name && (
              <View className="mt-1 px-2 py-0.5 bg-surface-active rounded border border-border mb-4">
                <Text className="font-body text-xs text-foreground-muted uppercase">
                  {profile.role_name.replace('_', ' ')}
                </Text>
              </View>
            )
          )}

          {/* EDITABLE FIELDS */}
          {isEditing ? (
            <View className="w-full mt-2 space-y-4">
              <View>
                <Text className="text-foreground text-xs mb-4 ml-1 font-body-bold">Nombre Completo</Text>
                <TextInput
                  value={editFullName}
                  onChangeText={setEditFullName}
                  className="bg-surface text-foreground font-body p-3 rounded-xl border border-surface-active"
                  placeholder="Tu nombre real"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View className="my-4">
                <Text className="text-foreground text-xs mb-4 ml-1 font-body-bold">Biografía</Text>
                <TextInput
                  value={editBio}
                  onChangeText={setEditBio}
                  className="bg-surface text-foreground font-body p-3 rounded-xl border border-surface-active h-20"
                  placeholder="Cuéntanos algo de ti..."
                  placeholderTextColor="#6B7280"
                  multiline
                  textAlignVertical='top'
                />
              </View>

              {/* Website Removed */}

              <View className="flex-row gap-3 my-4">
                <View className="flex-1">
                  <Text className="text-foreground text-xs mb-4 ml-1 font-body-bold">RUT / ID</Text>
                  <TextInput
                    value={editNationalId}
                    onChangeText={handleRutChange}
                    onBlur={handleRutBlur}
                    className="bg-surface text-foreground font-body p-3 rounded-xl border border-surface-active"
                    placeholder="12.345.678-9"
                    placeholderTextColor="#6B7280"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground text-xs mb-4 ml-1 font-body-bold">Fecha de nacimiento</Text>
                  <TextInput
                    value={editBirthDate}
                    onChangeText={setEditBirthDate}
                    onBlur={handleDateBlur}
                    className="bg-surface text-foreground font-body p-3 rounded-xl border border-surface-active"
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#6B7280"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="my-4">
                <Text className="text-foreground text-xs mb-4 ml-1 font-body-bold">Género</Text>
                <View className="flex-row gap-2 bg-surface p-1 rounded-xl border border-surface-active">
                  {['Masculino', 'Femenino'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setEditGender(g)}
                      className={`flex-1 py-2 rounded-lg items-center ${editGender === g ? 'bg-primary' : 'bg-transparent'}`}
                    >
                      <Text className={`text-xs ${editGender === g ? 'text-white font-bold' : 'text-foreground-muted'}`}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                  {/* Otros en un dropdown o separados si es necesario, simplificado por espacio */}
                  <TouchableOpacity
                    onPress={() => setEditGender('Otro')}
                    className={`px-3 py-2 rounded-lg items-center ${editGender === 'Otro' ? 'bg-primary' : 'bg-surface'}`}
                  >
                    <Text className={`text-xs ${editGender === 'Otro' ? 'text-white font-bold' : 'text-foreground-muted'}`}>Otro</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setEditGender('Prefiero no decir')}
                    className={`px-3 py-2 rounded-lg items-center ${editGender === 'Prefiero no decir' ? 'bg-primary' : 'bg-surface'}`}
                  >
                    <Text className={`text-xs ${editGender === 'Prefiero no decir' ? 'text-white font-bold' : 'text-foreground-muted'}`}>Omitir</Text>
                  </TouchableOpacity>
                </View>
              </View>



              <View className="my-4">
                <Text className="text-foreground text-xs mb-1 ml-1 font-body-bold">Preferencia de Precio</Text>
                <Text className="text-foreground-muted text-xs mb-4 ml-1">¿Cuanto estas dispuesto a gastar?</Text>
                <View className="flex-row gap-2 bg-surface p-1 rounded-xl border border-surface-active">
                  {PRICE_TIERS.map((tier) => (
                    <TouchableOpacity
                      key={tier.value}
                      onPress={() => setEditPricePreference(tier.value)}
                      className={`flex-1 py-2 rounded-lg items-center ${editPricePreference === tier.value ? 'bg-primary' : 'bg-transparent'}`}
                    >
                      <Text className={`font-bold ${editPricePreference === tier.value ? 'text-white' : 'text-foreground-muted'}`}>
                        {tier.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="my-8 border border-surface-active p-4 rounded-xl">
                <TouchableOpacity
                  onPress={() => setShowCuisinesHelper(!showCuisinesHelper)}
                  className="flex-row justify-between items-center mb-1"
                >
                  <Text className="text-foreground text-xs ml-1 mb-4 font-body-bold">Cocinas Favoritas ({editFavoriteCuisines.length})</Text>
                  <Ionicons name={showCuisinesHelper ? "chevron-up" : "chevron-down"} size={16} color="#6B7280" />
                </TouchableOpacity>

                {showCuisinesHelper && (
                  <View className="flex-row flex-wrap gap-2 bg-surface p-2 rounded-xl border border-surface-active">
                    {CUISINES_LIST.map((cuisine) => {
                      const isSelected = editFavoriteCuisines.includes(cuisine);
                      return (
                        <TouchableOpacity
                          key={cuisine}
                          onPress={() => {
                            if (isSelected) {
                              setEditFavoriteCuisines(prev => prev.filter(c => c !== cuisine));
                            } else {
                              setEditFavoriteCuisines(prev => [...prev, cuisine]);
                            }
                          }}
                          className={`px-3 py-2 rounded-full border ${isSelected ? 'bg-primary/20 border-primary' : 'bg-surface border-surface-active'}`}
                        >
                          <Text className={`text-xs ${isSelected ? 'text-primary font-bold' : 'text-foreground-muted'}`}>
                            {cuisine}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
                {!showCuisinesHelper && editFavoriteCuisines.length > 0 && (
                  <View className="flex-row flex-wrap gap-1 px-1">
                    {editFavoriteCuisines.slice(0, 5).map(c => (
                      <Text key={c} className="text-[10px] text-foreground-muted bg-surface-active px-2 py-0.5 rounded-full border border-surface-active">
                        {c}
                      </Text>
                    ))}
                    {editFavoriteCuisines.length > 5 && (
                      <Text className="text-[10px] text-foreground-muted pl-1">+{editFavoriteCuisines.length - 5} más</Text>
                    )}
                  </View>
                )}
              </View>

              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity onPress={() => setIsEditing(false)} className="flex-1 bg-surface py-3 rounded-xl items-center border border-surface-active">
                  <Text className="text-foreground-muted font-body-bold">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveProfile} className="flex-1 bg-primary py-3 rounded-xl items-center shadow-lg" disabled={uploading}>
                  {uploading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-body-bold">Guardar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="w-full items-center">
              {profile.full_name && (
                <Text className="text-lg text-foreground font-body-bold mb-1">{profile.full_name}</Text>
              )}
              {profile.bio && (
                <Text className="text-foreground-muted text-center italic px-4 mb-3">"{profile.bio}"</Text>
              )}

              {/* Website Removed */}

              {(profile.national_id || profile.birth_date || profile.is_influencer) && (
                <View className="flex-row flex-wrap gap-2 justify-center mt-1 mb-3">
                  {profile.is_influencer && <View className="bg-purple-500/20 px-2 py-1 rounded border border-purple-500/50"><Text className="text-purple-400 text-[10px] font-bold">INFLUENCER</Text></View>}
                  {profile.national_id && <View className="bg-surface-active px-2 py-1 rounded"><Text className="text-foreground-muted text-[10px]">🪪 RUT: {profile.national_id}</Text></View>}
                  {profile.birth_date && <View className="bg-surface-active px-2 py-1 rounded"><Text className="text-foreground-muted text-[10px]">🎂 {formatDateToDDMMYYYY(profile.birth_date)}</Text></View>}
                  {/* {profile.gender && <View className="bg-surface-active px-2 py-1 rounded"><Text className="text-foreground-muted text-[10px]">{profile.gender}</Text></View>} */}
                  {profile.price_preference && <View className="bg-surface-active px-2 py-1 rounded"><Text className="text-success text-[10px]">Presupuesto: {'$'.repeat(profile.price_preference)}</Text></View>}
                </View>
              )}

              {profile.favorite_cuisines && profile.favorite_cuisines.length > 0 && (
                <View className="flex-row flex-wrap gap-1 justify-center mb-3 px-4">
                  {profile.favorite_cuisines.map(c => (
                    <View key={c} className="bg-surface border border-surface-active px-2 py-0.5 rounded-full">
                      <Text className="text-foreground-muted text-[10px]">{c}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity onPress={handleStartEditing} className="px-4 py-2 mt-2 bg-surface rounded-full border border-surface-active">
                <Text className="text-primary font-body text-sm">Editar Perfil</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="bg-surface rounded-2xl p-4 border border-surface-active mt-4 flex-row justify-between">
          <View className="items-center flex-1 border-r border-surface-active">
            <Text className="font-brand text-2xl text-primary">{profile.points_current}</Text>
            <Text className="font-body text-xs text-foreground-muted">Puntos</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="font-brand text-2xl text-primary">{profile.reputation_score}</Text>
            <Text className="font-body text-xs text-foreground-muted">Reputación</Text>
          </View>
        </View>

        <View className="flex-row mt-4 gap-3">
          <View className="bg-surface rounded-2xl p-4 border border-surface-active flex-1 items-center">
            <Text className="font-brand text-xl text-foreground">{profile.reviews_count || 0}</Text>
            <Text className="font-body text-[10px] text-foreground-muted uppercase">Reseñas</Text>
          </View>
          <View className="bg-surface rounded-2xl p-4 border border-surface-active flex-1 items-center">
            <Text className="font-brand text-xl text-foreground">{profile.verified_checkins_count || 0}</Text>
            <Text className="font-body text-[10px] text-foreground-muted uppercase">Visitas</Text>
          </View>
          <View className="bg-surface rounded-2xl p-4 border border-surface-active flex-1 items-center">
            <Text className="font-brand text-xl text-foreground">{profile.photos_count || 0}</Text>
            <Text className="font-body text-[10px] text-foreground-muted uppercase">Fotos</Text>
          </View>
        </View>

        {/* --- INSIGNIAS (BADGES) --- */}
        <View className="mt-6">
          <Text className="font-brand text-lg text-foreground mb-3">Insignias Ganadas ({earnedBadges.length})</Text>
          {earnedBadges.length === 0 ? (
            <Text className="text-foreground-muted text-sm italic">
              Aún no tienes insignias. ¡Sigue explorando!
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pl-1">
              {earnedBadges.map((badge) => (
                <View key={badge.id} className="items-center mr-4 w-20">
                  <View className="w-16 h-16 bg-surface-active rounded-full items-center justify-center border-2 border-primary/20 mb-2 overflow-hidden shadow-sm">
                    {badge.icon_url ? (
                      <Image source={{ uri: badge.icon_url }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Text className="text-2xl">🏆</Text>
                    )}
                  </View>
                  <Text className="text-[10px] text-foreground font-bold text-center leading-3" numberOfLines={2}>
                    {badge.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
          {ambassador_status && (
            <View className="mt-2 bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
              <Text className="text-primary font-body-bold text-[11px] text-center">
                🏆 {ambassador_status}
              </Text>
            </View>
          )}
        </View>

        {/* --- COMUNIDAD & SOCIAL (V13) --- */}
        <TouchableOpacity
          onPress={() => router.push('/(user)/community')}
          className="mt-6 bg-surface p-5 rounded-2xl border border-primary/20 shadow-lg flex-row items-center justify-between"
          style={{ backgroundColor: 'rgba(250, 78, 53, 0.05)' }}
        >
          <View className="flex-row items-center gap-4">
            <View className="bg-primary/20 p-3 rounded-full">
              <Ionicons name="people" size={26} color="#FA4E35" />
            </View>
            <View>
              <Text className="font-brand text-xl text-foreground">Mi Comunidad</Text>
              <Text className="text-foreground-muted text-xs">Amigos, invitaciones y retos grupales</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FA4E35" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(user)/wallet')}
          className="mt-6 bg-surface p-4 rounded-xl items-center shadow-sm border border-surface-active flex-row justify-center gap-2 relative"
        >
          <Ionicons name="wallet-outline" size={24} color="#FA4E35" />
          <Text className="text-foreground font-brand text-lg">Mi Billetera</Text>

          {walletSummary && walletSummary.pending_rewards > 0 && (
            <View className="absolute top-3 right-4 bg-primary px-2 py-1 rounded-full">
              <Text className="text-white text-[10px] font-bold">
                {walletSummary.pending_rewards} NUEVO
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setScannerVisible(true)}
          className="mt-4 bg-primary p-4 rounded-xl items-center shadow-sm"
        >
          <Text className="text-primary-foreground font-brand text-lg">📸 Escanear QR</Text>
        </TouchableOpacity>

        {/* --- CHALLENGES --- */}
        <View className="mt-6 mb-4">
          <View className="flex-row justify-between items-end mb-3">
            <Text className="font-brand text-lg text-foreground">Retos Activos</Text>
            {activeChallenges.length > 0 && (
              <View className="bg-primary/20 px-2 py-0.5 rounded-full">
                <Text className="text-primary text-[10px] font-bold">{activeChallenges.length} EN CURSO</Text>
              </View>
            )}
          </View>

          {activeChallenges.length === 0 ? (
            <View className="bg-surface p-4 rounded-xl border border-surface-active border-dashed items-center py-6">
              <Ionicons name="trophy-outline" size={32} color="#9CA3AF" />
              <Text className="text-foreground-muted text-sm mt-2 text-center">No tienes retos activos por ahora.</Text>
            </View>
          ) : (
            <View className="space-y-3">
              {activeChallenges.map((chal) => (
                <View key={chal.id} className="bg-surface p-4 rounded-xl border border-surface-active shadow-sm flex-row gap-3">
                  <View className="mt-1">
                    <Ionicons
                      name={chal.challenge_type === 'CHECKIN_COUNT' ? "location" : "star"}
                      size={20}
                      color="#FA4E35"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-body-bold text-sm">{chal.title}</Text>
                    <Text className="text-foreground-muted text-xs mb-2">{chal.description}</Text>

                    {/* Progress Bar */}
                    <View className="h-2 bg-surface-active rounded-full overflow-hidden w-full relative">
                      <View
                        className="bg-primary h-full absolute left-0 top-0"
                        style={{ width: `${Math.min((chal.current_value / chal.target_value) * 100, 100)}%` }}
                      />
                    </View>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-[10px] text-foreground-muted">{chal.current_value} / {chal.target_value}</Text>
                      <Text className="text-[10px] text-primary font-bold">+{chal.reward_points} pts</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Check-ins List */}
        <View className="mt-8 flex-1">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="font-brand text-xl text-foreground">Últimos Check-ins</Text>
          </View>

          {!checkins || checkins.length === 0 ? (
            <Text className="text-foreground-muted text-center py-4 italic">
              Aún no has hecho check-ins. ¡Visita un local!
            </Text>
          ) : (
            <View className="bg-surface rounded-xl border border-surface-active overflow-hidden">
              {checkins.map((checkin) => (
                <View key={checkin.id} className="p-4 border-b border-surface-active flex-row justify-between items-center last:border-b-0">
                  <View>
                    <Text className="text-foreground font-body-bold">
                      {checkin.venue_name || `Local ID: ${checkin.venue_id.substring(0, 8)}...`}
                    </Text>
                    <Text className="text-foreground-muted text-xs">
                      {formatDistanceToNow(new Date(checkin.created_at), { addSuffix: true, locale: es })}
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${checkin.status === 'confirmed' ? 'bg-success/20' :
                    checkin.status === 'rejected' ? 'bg-destructive/20' : 'bg-warning/20'
                    }`}>
                    <Text className={`text-[10px] font-bold uppercase ${checkin.status === 'confirmed' ? 'text-success' :
                      checkin.status === 'rejected' ? 'text-destructive' : 'text-warning'
                      }`}>
                      {checkin.status === 'confirmed' ? 'Confirmado' :
                        checkin.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="mt-12 mb-8"
        >
          <Text className="text-destructive font-body-bold text-center">Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
      <QRScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
      />
    </SafeAreaView >
  );
}

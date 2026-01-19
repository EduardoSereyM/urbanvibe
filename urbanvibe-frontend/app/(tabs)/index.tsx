import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVenues } from '../../src/hooks/useVenues';
import type { Venue } from '../../src/types';

export default function ZonaCeroScreen() {
  const { data: venues, isLoading, isError } = useVenues();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#FA4E35" />
        <Text className="text-foreground font-body mt-4">Cargando locales...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground font-body text-lg">No pudimos cargar los locales</Text>
        <Text className="text-red-400 text-sm mt-2">Inténtalo nuevamente en unos minutos.</Text>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Venue }) => (
    <View className="bg-surface rounded-xl p-4 mb-3 border border-foreground/5">
      <Text className="text-lg font-brand text-foreground">{item.name}</Text>

      {item.overview ? (
        <Text className="mt-1 text-sm font-body text-foreground-muted" numberOfLines={2}>
          {item.overview}
        </Text>
      ) : null}

      {item.location ? (
        <Text className="mt-2 text-xs font-body text-foreground-muted">
          Lat: {item.location.lat.toFixed(4)}, Lng: {item.location.lng.toFixed(4)}
        </Text>
      ) : null}

      {item.trust_tier === 'verified_safe' && (
        <View className="self-start mt-3 px-3 py-1 rounded-full bg-success">
          <Text className="text-xs font-body-bold text-foreground uppercase">
            Seguro
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background px-4 pt-4">
      <FlatList
        data={venues}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

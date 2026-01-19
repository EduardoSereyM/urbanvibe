// src/hooks/useProfile.ts
import { useQuery } from '@tanstack/react-query';
import { client } from '../api/client';

// 👇 Nuestro tipo explícito para el perfil que devuelve el backend
export interface AppProfile {
  id: string;
  full_name: string | null;
  display_name: string | null;
  username: string | null; // ✅ Refactor: Mandatory Username
  email: string | null; // ✅ Refactor: Read-only email
  avatar_url: string | null;
  bio?: string | null; // ✅ NUEVO
  reputation_score: number;
  points_current: number;
  roles: string[]; // ✅ NUEVO - Array de roles del usuario
  role_name?: string; // For display purposes from BFF

  // Extended Profile Fields
  national_id?: string;
  birth_date?: string;
  gender?: string;
  is_influencer?: boolean;
  preferences?: Record<string, any>;
  favorite_cuisines?: string[];
  price_preference?: number;
  referral_code?: string;
  website?: string;
  reviews_count?: number;
  photos_count?: number;
  verified_checkins_count?: number;
  current_city?: string;
  points_lifetime?: number;
  current_level_id?: string | number | null;
  current_level_name?: string | null;
  referred_by_user_id?: string | null; // V12.4
}

/**
 * Fetches the current user's profile from the backend.
 * Endpoint: GET /profiles/me
 * @returns Promise<AppProfile>
 */
async function fetchProfile(): Promise<AppProfile> {
  const response = await client.get('/profiles/me');
  return response.data;
}



async function updateProfile(data: ProfileUpdatePayload): Promise<AppProfile> {
  const response = await client.patch('/profiles/me', data);
  return response.data;
}

/**
 * Hook to access the current user's profile data.
 * React Query caches this data under ['profile', 'me'].
 * 
 * @example
 * const { data: profile } = useProfile();
 * console.log(profile?.username);
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useProfile() {
  const queryClient = useQueryClient();

  const query = useQuery<AppProfile>({
    queryKey: ['profile', 'me'],
    queryFn: fetchProfile,
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedProfile) => {
      // Update cache instantly
      queryClient.setQueryData(['profile', 'me'], updatedProfile);
    },
  });

  return { ...query, updateProfile: mutation };
}

import { fetchMyCheckins } from '../api/client';
import { CheckinResponse, ProfileUpdatePayload } from '../api/types';

export function useMyCheckins() {
  return useQuery<CheckinResponse[]>({
    queryKey: ['checkins', 'me'],
    queryFn: fetchMyCheckins,
  });
}

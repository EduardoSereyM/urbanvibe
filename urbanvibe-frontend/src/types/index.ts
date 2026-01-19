// src/types/index.ts

// La carpeta types es para los tipos de datos que se usan en el frontend.
// este index.ts es el archivo de tipos para el frontend. 
// aqui se definen los tipos que se usan en el frontend para los venues.

export interface VenueLocation {   // tipo para la ubicación del local
  lat: number;
  lng: number;
}

export interface Venue {           // tipo para el local    
  id: string;
  name: string;
  slogan?: string | null;
  category_id?: number | string | null;
  category_name?: string | null;
  mood_tags?: string[];
  overview?: string | null;

  // Confianza / reputación
  trust_tier?: string | null;
  is_verified: boolean;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_founder_venue?: boolean;
  verified_visits_monthly: number;
  rating_average: number;
  review_count: number;

  // Media
  logo_url?: string;
  cover_image_urls?: string[];
  menu_media_urls?: Array<{
    url: string;
    type: string;
    name?: string;
  }>;

  // Precio
  price_tier?: number | null;
  avg_price_min?: number | null;
  avg_price_max?: number | null;
  currency_code?: string | null;

  // Contacto & Operación
  contact_phone?: string | null;
  website?: string | null;
  operational_status?: string | null; // 'open', 'closed'

  // Dirección
  address_display?: string | null;

  // Geo
  location: VenueLocation | null;

  // Extra
  opening_hours?: {
    regular: any[];
    exceptions?: any[];
  } | null;
  timezone?: string;
  favorites_count?: number;
}

// Auth & Custom Claims
export interface AppUserMetadata {
  app_role?: string;     // 'VENUE_OWNER', 'APP_USER', etc.
  app_role_id?: number;  // 1-5
}

export interface VenueFavoriteItem {
  id: string;
  name: string;
  category_name?: string | null;
  rating_average?: number;
  price_tier?: number;
  logo_url?: string | null;
  cover_image_urls?: string[];
}

export interface ProfileSummary {
  id: string;
  username: string;
  avatar_url?: string | null;
  points_current: number;
}

export interface VenueMapItem {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  latitude: number;
  longitude: number;
  category_name?: string | null;
  rating_average: number;
  price_tier: number;
  logo_url?: string | null;
  cover_image_urls: string[];
  address_display?: string | null;
  is_verified: boolean;
}

export interface ExploreContextResponse {
  profile?: ProfileSummary | null;
  map_venues: VenueMapItem[];
}

// BFF Types
export interface UserPromotionBFFItem {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  promo_type: 'standard' | 'uv_reward';
  reward_tier?: string;
  points_cost?: number;
  is_active: boolean;
  can_redeem: boolean;
  redeem_alert?: string;
}


export interface VenueDetailBFFResponse {
  venue: Venue;
  is_favorite: boolean;
  active_promotions: UserPromotionBFFItem[];
}

export interface VenueListItemBFF extends Venue {
  is_favorite: boolean;
}
// Profile BFF
import { CheckinResponse, Badge, Challenge } from '../api/types';
import { AppProfile } from '../hooks/useProfile'; // Or define simplified Profile here

export interface WalletSummary {
  pending_rewards: number;
}

export interface ProfileContextBFFResponse {
  profile: AppProfile;
  recent_checkins: CheckinResponse[];
  wallet_summary: WalletSummary;
  earned_badges: Badge[];
  active_challenges: Challenge[];
  referral_code?: string | null;
  ambassador_status?: string | null;
}

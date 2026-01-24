// src/api/types.ts
// Tipos específicos para la API B2B de administración de locales

export interface VenueFeaturesConfig {
  chat: boolean;
  checkins_history_days?: number | null;
  advanced_dashboard?: boolean | null;
}

export interface VenueSummaryForOwner {
  id: string;
  type?: 'casa_matriz' | 'sucursal' | null;
  parent_id?: string | null;
  name: string;
  city?: string | null;
  operational_status?: string | null;
  is_founder_venue: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  roles: string[];
  features_config?: VenueFeaturesConfig | null;
  logo_url?: string | null;
  created_at: string;
}

export interface MyVenuesResponse {
  venues: VenueSummaryForOwner[];
}

export interface OpeningHoursRegularSlot {
  day: string;
  open?: string | null;
  close?: string | null;
  closed: boolean;
}

export interface OpeningHoursException {
  date: string;
  label?: string | null;
  open?: string | null;
  close?: string | null;
  closed: boolean;
}

export interface OpeningHoursConfig {
  timezone: string;
  regular: OpeningHoursRegularSlot[];
  exceptions: OpeningHoursException[];
}

export interface VenueAddress {
  address_display?: string | null;
  city?: string | null;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_operational?: boolean;
  skip?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at' | 'rating';
  sort_order?: 'asc' | 'desc';
}

export interface AdminVenuesFilters {
  search?: string;
  city?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_operational?: boolean;
  skip?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at' | 'rating';
  sort_order?: 'asc' | 'desc';
}

export interface AdminVenueDetailResponse {
  id: string;
  name: string;
  legal_name?: string | null;
  slogan?: string | null;
  overview?: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_operational: boolean;
  is_founder_venue: boolean;

  address: {
    address_display?: string | null;
    city?: string | null;
    region?: string | null;
    region_state?: string | null;
    country_code?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    address_street?: string | null;
    address_number?: string | null;
    directions_tip?: string | null;
  };

  contact?: {
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  };

  metrics: {
    total_verified_visits: number;
    verified_visits_this_month: number;
    rating_average: number;
    total_reviews: number;
  };

  owner?: {
    id: string;
    display_name?: string | null;
    email: string;
  };



  opening_hours?: OpeningHoursConfig;

  // Extended Attributes
  connectivity_features?: string[];
  accessibility_features?: string[];
  space_features?: string[];
  comfort_features?: string[];
  audience_features?: string[];
  entertainment_features?: string[];
  dietary_options?: string[];
  access_features?: string[];
  security_features?: string[];
  mood_tags?: string[];
  occasion_tags?: string[];

  music_profile?: Record<string, any>;
  crowd_profile?: Record<string, any>;
  pricing_profile?: Record<string, any>;

  capacity_estimate?: number;
  seated_capacity?: number;
  standing_allowed?: boolean;
  noise_level?: string;

  menu_media_urls?: any[];
  menu_last_updated_at?: string;
  logo_url?: string;
  cover_image_urls?: string[];
  ownership_proof_url?: string;

  referral_code?: string;
  company_tax_id?: string | null;
  category_id?: number | null;
  admin_notes?: string | null;
  features_config?: VenueFeaturesConfig | null;
  directions_tip?: string | null;

  price_tier?: number;
  avg_price_min?: number;
  avg_price_max?: number;
  currency_code?: string;
}



// Wait, I need to be careful. The backend schema VenueAdminListItem has:
// rating_average: float
// total_reviews: int
// total_verified_visits: int
//
// The frontend list.tsx uses:
// item.metrics.rating_average
//
// So I need to fix BOTH address and metrics in list.tsx, AND define the type correctly here.

export interface VenueAdminListItem {
  id: string;
  name: string;
  legal_name?: string | null;
  city?: string | null;
  address_display?: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_verified: boolean;
  operational_status?: string | null;
  is_operational: boolean;
  rating_average: number;
  total_reviews: number;
  total_verified_visits: number;
  created_at: string;
  owner?: {
    id: string;
    display_name?: string | null;
    email: string;
    phone?: string | null;
  };
}

export interface AdminVenuesListResponse {
  venues: VenueAdminListItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface ActivityItem {
  id: string;
  type: 'review' | 'checkin' | 'promotion';
  title: string;
  subtitle?: string | null;
  timestamp: string;
  metadata?: Record<string, any>;
  is_alert: boolean;
}

export interface VenueB2BDetail {
  id: string;
  name: string;
  legal_name?: string | null;
  slogan?: string | null;
  overview?: string | null;

  address_display?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;

  verification_status: 'pending' | 'verified' | 'rejected';
  operational_status?: string | null;
  is_founder_venue: boolean;

  contact?: {
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  };

  // Metrics (Flat for compatibility)
  verified_visits_all_time: number;
  verified_visits_monthly: number;
  rating_average: number;
  review_count: number;
  unread_reviews_count?: number;

  cover_image_urls?: string[];
  points_balance: number;

  // Extended Attributes (Vibe)
  connectivity_features?: string[];
  accessibility_features?: string[];
  space_features?: string[];
  comfort_features?: string[];
  audience_features?: string[];
  entertainment_features?: string[];
  dietary_options?: string[];
  access_features?: string[];
  security_features?: string[];
  mood_tags?: string[];
  occasion_tags?: string[];

  music_profile?: Record<string, any>;
  crowd_profile?: Record<string, any>;

  capacity_estimate?: number;
  seated_capacity?: number;
  standing_allowed?: boolean;
  noise_level?: string;

  // Added missing fields used in UI
  logo_url?: string | null;
  category_id?: number | null;
  price_tier?: number | null;
  currency_code?: string | null;
  payment_methods?: Record<string, boolean>;

  recent_activity?: ActivityItem[];

  address?: {
    address_display?: string;
    city?: string;
    region_state?: string;
    country_code?: string;
    region_id?: number | null;
    city_id?: number | null;
  };
  opening_hours?: {
    regular: Array<{ day: string; open?: string; close?: string; closed: boolean }>;
    exceptions?: Array<any>;
  };
  company_tax_id?: string | null;
  ownership_proof_url?: string | null;

  created_at: string;
  updated_at: string;
}

export interface VenueCreatePayload {
  name: string;
  legal_name?: string;
  slogan?: string;
  overview?: string;
  latitude: number;
  longitude: number;
  address: {
    address_display: string;
    city: string;
    region_state?: string;
    country_code: string;
    region_id?: number;
    city_id?: number;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };


  // Extended Attributes
  connectivity_features?: string[];
  accessibility_features?: string[];
  space_features?: string[];
  comfort_features?: string[];
  audience_features?: string[];
  entertainment_features?: string[];
  dietary_options?: string[];
  access_features?: string[];
  security_features?: string[];
  mood_tags?: string[];
  occasion_tags?: string[];

  music_profile?: Record<string, any>;
  crowd_profile?: Record<string, any>;
  pricing_profile?: Record<string, any>;

  capacity_estimate?: number;
  seated_capacity?: number;
  standing_allowed?: boolean;
  noise_level?: string;
}

export interface VenueQRResponse {
  id: string;
  name: string;
  address_display?: string;
  city?: string;
  qr_content?: string;
}

// ============================================================================
// Admin Users Types - SUPER_ADMIN Only
// ============================================================================

export interface AdminUserListItem {
  id: string;
  username: string | null;
  email: string;
  display_name: string | null;
  reputation_score: number;
  points_current: number;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
  is_active: boolean;
  total_venues: number;
  total_reviews: number;
}

export interface AdminUsersListResponse {
  users: AdminUserListItem[];
  total: number;
  skip: number;
  limit: number;
}

export interface AdminUserDetailResponse {
  // Identity
  id: string;
  username: string | null;
  email: string;
  full_name?: string | null;
  display_name: string | null;
  national_id?: string | null;
  birth_date?: string | null; // Date string YYYY-MM-DD
  gender?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  website?: string | null;

  // Status & Flags
  status?: string | null;
  is_verified: boolean;
  is_influencer: boolean;
  is_active: boolean; // Computed from auth

  // Role
  role_id: number;
  role_name?: string | null;

  // Gamification & Stats
  reputation_score: number;
  points_current: number;
  points_lifetime: number;
  current_level_id?: number | null;
  reviews_count: number;
  photos_count: number;
  verified_checkins_count: number;

  // Preferences
  preferences?: Record<string, any> | null;
  favorite_cuisines?: string[] | null;
  price_preference?: number | null;

  // Location
  current_city?: string | null;

  // Referral
  referral_code?: string | null;
  referral_source?: string | null;
  referred_by_user_id?: string | null;

  roles: Array<{
    role_name: string;
    venue_id: string | null;
    venue_name: string | null;
    is_active: boolean;
    assigned_at: string;
  }>;

  auth_info: {
    created_at: string;
    last_sign_in_at: string | null;
    email_confirmed_at: string | null;
    phone: string | null;
    phone_confirmed_at: string | null;
  };

  activity: {
    total_venues_owned: number;
    total_reviews: number;
    total_check_ins: number;
    last_activity_at: string | null;
  };

  venues_owned: Array<{
    id: string;
    name: string;
    role: string;
    is_active: boolean;
  }>;
}

export interface AdminUsersFilters {
  search?: string;
  role?: string;
  is_active?: boolean;
  skip?: number;
  limit?: number;
  sort_by?: 'email' | 'created_at' | 'display_name';
  sort_order?: 'asc' | 'desc';
}

export interface AdminUserUpdatePayload {
  // Identity
  username?: string;
  full_name?: string;
  display_name?: string;
  national_id?: string;
  birth_date?: string;
  gender?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;

  // Status & Flags
  status?: string;
  is_verified?: boolean;
  is_influencer?: boolean;
  is_active?: boolean;

  // Role
  role_id?: number;

  // Gamification
  reputation_score?: number;
  points_current?: number;
  points_lifetime?: number;
  reviews_count?: number;
  photos_count?: number;
  verified_checkins_count?: number;

  // Preferences
  preferences?: Record<string, any>;
  favorite_cuisines?: string[];
  price_preference?: number;

  // Location
  current_city?: string;

  // Referral
  referral_source?: string;
}

// ============================================================================
// Admin Venue Update Types
// ============================================================================

export interface AdminVenueUpdatePayload {
  name?: string;
  legal_name?: string;
  slogan?: string;
  overview?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_operational?: boolean;
  is_founder_venue?: boolean;
  opening_hours?: OpeningHoursConfig;
  owner_id?: string;

  address?: {
    address_display?: string;
    city?: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    directions_tip?: string;
  };

  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };



  // Extended Attributes
  connectivity_features?: string[];
  accessibility_features?: string[];
  space_features?: string[];
  comfort_features?: string[];
  audience_features?: string[];
  entertainment_features?: string[];
  dietary_options?: string[];
  access_features?: string[];
  security_features?: string[];
  mood_tags?: string[];
  occasion_tags?: string[];

  music_profile?: Record<string, any>;
  crowd_profile?: Record<string, any>;
  pricing_profile?: Record<string, any>;

  capacity_estimate?: number;
  seated_capacity?: number;
  standing_allowed?: boolean;
  noise_level?: string;

  menu_media_urls?: any[];
  logo_url?: string;
  cover_image_urls?: string[];
  ownership_proof_url?: string;

  referral_code?: string;
  company_tax_id?: string;
  category_id?: number;
  admin_notes?: string;
  features_config?: VenueFeaturesConfig;

  price_tier?: number;
  avg_price_min?: number;
  avg_price_max?: number;
  currency_code?: string;
}

// ============================================================================
// Admin Metrics Types
// ============================================================================

export interface AdminMetricsResponse {
  totals: {
    total_users: number;
    total_venues: number;
    total_reviews: number;
    total_verified_visits: number;
    active_users_last_30d: number;
  };

  venues: {
    by_status: {
      verified: number;
      pending: number;
      rejected: number;
    };
    by_operational_status: {
      operational: number;
      inactive: number;
      open?: number;
      closed?: number;
    };
    by_city: Array<{
      city: string;
      count: number;
    }>;
    founder_venues: number;
  };

  users: {
    by_role: Record<string, number>;
    new_users_last_30d: number;
    active_users_last_7d: number;
  };

  activity: {
    reviews_last_30d: number;
    check_ins_last_30d: number;
    new_venues_last_30d: number;
  };

  top_venues: Array<{
    id: string;
    name: string;
    city: string;
    rating_average: number;
    total_reviews: number;
    total_verified_visits: number;
  }>;

  recent_activity: Array<{
    type: 'new_venue' | 'new_user' | 'venue_verified' | 'checkin';
    venue_name?: string;
    user_email?: string;
    timestamp: string;
  }>;
}

export interface VenueCheckinDetail {
  id: number;
  user_id: string;
  user_display_name: string | null;
  user_email: string | null;
  status: string;
  geofence_passed: boolean;
  points_awarded: number;
  created_at: string;
  session_duration_minutes?: number;
  visit_purpose?: string[];
  spend_bucket?: string;
}

export interface VenueCheckinListResponse {
  checkins: VenueCheckinDetail[];
}

export interface CheckinResponse {
  id: number;
  user_id: string;
  venue_id: string;
  venue_name?: string | null;
  status: string;
  geofence_passed: boolean;
  created_at: string;
  points_awarded?: number;
  session_duration_minutes?: number;
  visit_purpose?: string[];
  spend_bucket?: string;
}

// ============================================================================
// Gamification & Promotions Types
// ============================================================================

export interface Promotion {
  id: string;
  venue_id: string;
  title: string;
  description?: string;
  image_url?: string;
  active_days?: Record<string, any>;
  target_audience?: Record<string, any>;

  promo_type: 'standard' | 'uv_reward';
  reward_tier?: 'LOW' | 'MID' | 'HIGH';
  points_cost?: number;

  is_recurring: boolean;
  schedule_config?: Record<string, any>;
  total_units?: number;

  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;

  // V4 New Fields
  is_highlighted: boolean;
  highlight_until?: string;
}

export interface VenuePointsLog {
  id: string;
  venue_id: string;
  delta: number;
  reason: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface GamificationEvent {
  id: string;
  event_code: string;
  target_type: 'user' | 'venue';
  description?: string;
  points: number;
  is_active: boolean;
  config?: Record<string, any>;
  created_at: string;
}

export interface RewardUnit {
  id: string;
  promotion_id: string;
  venue_id: string;
  user_id?: string;
  status: 'available' | 'reserved' | 'consumed' | 'expired';
  assigned_at?: string;
  consumed_at?: string;
  checkin_id?: number;
}

export interface Redemption {
  id: string;
  user_id: string;
  venue_id: string;
  promotion_id?: string;
  reward_unit_id?: string;
  points_spent: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  confirmed_at?: string;
}

// ============================================================================
// Reviews & Trust Types
// ============================================================================

export interface Review {
  id: string;
  venue_id: string;
  user_id: string;
  user_display_name?: string;
  user_avatar_url?: string;
  checkin_id?: number;
  general_score: number;
  sub_scores?: Record<string, number>;
  comment?: string;
  media_urls?: string[];
  created_at: string;
  deleted_at?: string;

  // Owner Response
  owner_response?: string;
  owner_responded_at?: string;
  owner_responded_by?: string;

  // Social Proof & Moderation
  helpful_count: number;
  report_count: number;
}

export interface ReviewReaction {
  id: number;
  review_id: string;
  user_id: string;
  reaction_type: 'helpful' | 'funny' | 'love';
  created_at: string;
}

export interface ContentReport {
  id: string;
  target_type: 'review' | 'venue' | 'photo' | 'user';
  target_id: string;
  reporter_id?: string;
  reason: 'spam' | 'harassment' | 'fake' | 'off_topic';
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

// ============================================================================
// User Promotions Types
// ============================================================================

export interface UserPromotionResponse {
  id: string;
  venue_id: string;
  title: string;
  description?: string;
  image_url?: string;
  promo_type: 'standard' | 'uv_reward';
  reward_tier?: string;
  points_cost?: number;
  is_active: boolean;
  can_redeem?: boolean;
  redeem_alert?: string | null;
}

export interface Profile {
  id: string;
  username?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role_id?: number;
  role_name?: string;
  roles?: string[];

  // New Fields
  national_id?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  is_influencer?: boolean;

  favorite_cuisines?: string[];
  price_preference?: number | null;
  preferences?: Record<string, any>;

  referral_code?: string | null;
  website?: string | null;
  bio?: string | null;

  // Counters
  reviews_count?: number;
  photos_count?: number;
  verified_checkins_count?: number;

  reputation_score?: number;
  points_current?: number;
  current_level_name?: string | null;
  current_level_id?: string | null;
  referred_by_user_id?: string | null; // V12.4

  // Location
  country_code?: string | null;
  region_id?: number | null;
  city_id?: number | null;
}

export interface ClaimResponse {
  success: boolean;
  redemption_id?: string;
  qr_content?: string;
  points_spent?: number;
  message: string;
  reward_unit_id?: string;
}

export interface WalletItemResponse {
  id: string;
  venue_name: string;
  venue_id: string;
  promotion_title: string;
  promo_type: string;
  qr_content?: string;
  status: 'available' | 'reserved' | 'consumed' | 'expired';
  created_at?: string;
  points_spent?: number;
  valid_until?: string;
  image_url?: string;
}

export interface ProfileUpdatePayload {
  username?: string;
  full_name?: string;
  bio?: string;
  website?: string;
  avatar_url?: string;
  national_id?: string;
  birth_date?: string;
  gender?: string;
  is_influencer?: boolean;
  preferences?: Record<string, any>;
  favorite_cuisines?: string[];
  price_preference?: number;
  current_city?: string;

  country_code?: string;
  region_id?: number;
  city_id?: number;
}

export interface ReviewsListResponse {
  reviews: Review[];
  total: number;
  skip: number;
  limit: number;
}

// --- Gamification Types ---
export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  category: string;
  awarded_at?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  challenge_type: string;
  target_value: number;
  current_value: number;
  is_completed: boolean;
  reward_points: number;
  end_date?: string;
}

export interface WalletSummary {
  pending_rewards: number;
}

export interface ProfileContextBFFResponse {
  profile: Profile;
  recent_checkins: any[]; // Avoid circular dep or unknown type issues if CheckinResponse not imported, assuming any for now or CheckinResponse if known. 
  // actually CheckinResponse is likely defined in this file.
  wallet_summary: WalletSummary;
  earned_badges: Badge[];
  active_challenges: Challenge[];
  referral_code?: string | null; // V12.4
  ambassador_status?: string | null; // V12.4
}

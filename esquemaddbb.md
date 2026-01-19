-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.app_roles (
  id integer NOT NULL DEFAULT nextval('app_roles_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  CONSTRAINT app_roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.badges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon_url text,
  category text DEFAULT 'GENERAL'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT badges_pkey PRIMARY KEY (id)
);
CREATE TABLE public.challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL,
  target_value integer NOT NULL DEFAULT 1,
  filters jsonb DEFAULT '{}'::jsonb,
  period_start timestamp with time zone,
  period_end timestamp with time zone,
  is_active boolean DEFAULT true,
  reward_points integer DEFAULT 0,
  reward_badge_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  reward_promotion_id uuid,
  CONSTRAINT challenges_pkey PRIMARY KEY (id),
  CONSTRAINT challenges_reward_badge_fk FOREIGN KEY (reward_badge_id) REFERENCES public.badges(id),
  CONSTRAINT challenges_reward_promo_fk FOREIGN KEY (reward_promotion_id) REFERENCES public.promotions(id)
);
CREATE TABLE public.checkins (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  location USER-DEFINED,
  user_accuracy_m double precision,
  geofence_passed boolean DEFAULT false,
  token_id uuid NOT NULL UNIQUE,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'confirmed'::character varying, 'rejected'::character varying]::text[])),
  verified_at timestamp with time zone,
  verified_by uuid,
  points_awarded integer DEFAULT 0,
  venue_rating_to_user smallint CHECK (venue_rating_to_user >= 1 AND venue_rating_to_user <= 5),
  venue_comment_to_user text,
  created_at timestamp with time zone DEFAULT now(),
  checkin_date date NOT NULL DEFAULT (CURRENT_TIMESTAMP)::date,
  session_duration_minutes integer,
  visit_purpose jsonb DEFAULT '[]'::jsonb,
  spend_bucket character varying CHECK (spend_bucket IS NULL OR (spend_bucket::text = ANY (ARRAY['bajo'::character varying, 'medio'::character varying, 'alto'::character varying]::text[]))),
  CONSTRAINT checkins_pkey PRIMARY KEY (id),
  CONSTRAINT checkins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT checkins_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id),
  CONSTRAINT checkins_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.profiles(id),
  CONSTRAINT checkins_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.qr_tokens(id)
);
CREATE TABLE public.cities (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  region_id bigint,
  name text NOT NULL,
  CONSTRAINT cities_pkey PRIMARY KEY (id),
  CONSTRAINT cities_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id)
);
CREATE TABLE public.content_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  target_type character varying NOT NULL CHECK (target_type::text = ANY (ARRAY['review'::character varying, 'venue'::character varying, 'photo'::character varying, 'user'::character varying]::text[])),
  target_id uuid NOT NULL,
  reporter_id uuid,
  reason character varying NOT NULL,
  details text,
  status character varying DEFAULT 'pending'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT content_reports_pkey PRIMARY KEY (id),
  CONSTRAINT content_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.countries (
  code character NOT NULL,
  name text NOT NULL,
  CONSTRAINT countries_pkey PRIMARY KEY (code)
);
CREATE TABLE public.gamification_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_code text NOT NULL UNIQUE,
  target_type text NOT NULL CHECK (target_type = ANY (ARRAY['user'::text, 'venue'::text])),
  description text,
  points integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gamification_events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gamification_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_code text NOT NULL,
  user_id uuid,
  venue_id uuid,
  points integer NOT NULL,
  source_entity text,
  source_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gamification_logs_pkey PRIMARY KEY (id),
  CONSTRAINT gamelog_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT gamelog_venue_fk FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.levels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  min_points integer NOT NULL,
  benefits jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT levels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.menu_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL,
  section_name character varying,
  name character varying NOT NULL,
  description text,
  price integer CHECK (price >= 0),
  image_url text,
  dietary_tags ARRAY,
  is_available boolean DEFAULT true,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT menu_items_pkey PRIMARY KEY (id),
  CONSTRAINT menu_items_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.menu_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL,
  action text NOT NULL CHECK (action = ANY (ARRAY['created'::text, 'updated'::text, 'deleted'::text])),
  old_value jsonb,
  new_value jsonb,
  changed_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT menu_logs_pkey PRIMARY KEY (id),
  CONSTRAINT menulog_venue_fk FOREIGN KEY (venue_id) REFERENCES public.venues(id),
  CONSTRAINT menulog_user_fk FOREIGN KEY (changed_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  type character varying DEFAULT 'info'::character varying,
  is_read boolean DEFAULT false,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username character varying UNIQUE,
  full_name character varying,
  display_name character varying,
  national_id character varying,
  birth_date date,
  gender character varying,
  avatar_url text,
  bio character varying,
  website text,
  status character varying DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'inactive'::character varying, 'banned'::character varying]::text[])),
  is_verified boolean DEFAULT false,
  is_influencer boolean DEFAULT false,
  referral_source character varying,
  preferences jsonb DEFAULT '{"dietary": [], "interests": [], "accessibility": {}}'::jsonb,
  favorite_cuisines ARRAY,
  price_preference smallint CHECK (price_preference >= 1 AND price_preference <= 4),
  points_current integer DEFAULT 0,
  reputation_score integer DEFAULT 0,
  reviews_count integer DEFAULT 0,
  photos_count integer DEFAULT 0,
  verified_checkins_count integer DEFAULT 0,
  home_location USER-DEFINED,
  work_location USER-DEFINED,
  current_city character varying,
  last_known_location USER-DEFINED,
  last_activity_at timestamp with time zone,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  points_lifetime integer DEFAULT 0,
  referral_code text UNIQUE,
  referred_by_user_id uuid,
  role_id integer NOT NULL DEFAULT 5,
  email character varying,
  current_level_id uuid,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_referred_by_user_fk FOREIGN KEY (referred_by_user_id) REFERENCES public.profiles(id),
  CONSTRAINT profiles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.app_roles(id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_current_level_fk FOREIGN KEY (current_level_id) REFERENCES public.levels(id)
);
CREATE TABLE public.promo_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  action text NOT NULL CHECK (action = ANY (ARRAY['created'::text, 'updated'::text, 'activated'::text, 'deactivated'::text, 'unit_created'::text, 'unit_consumed'::text])),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT promo_logs_pkey PRIMARY KEY (id),
  CONSTRAINT promolog_promo_fk FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT promolog_venue_fk FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.promotions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL,
  title character varying NOT NULL,
  image_url text,
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone NOT NULL,
  active_days jsonb,
  target_audience jsonb,
  usage_limit integer,
  is_active boolean DEFAULT true,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  promo_type text DEFAULT 'standard'::text CHECK (promo_type = ANY (ARRAY['standard'::text, 'uv_reward'::text])),
  reward_tier text CHECK (reward_tier = ANY (ARRAY['LOW'::text, 'MID'::text, 'HIGH'::text])),
  points_cost integer,
  is_recurring boolean DEFAULT false,
  schedule_config jsonb DEFAULT '{}'::jsonb,
  total_units integer,
  is_highlighted boolean DEFAULT false,
  highlight_until timestamp with time zone,
  CONSTRAINT promotions_pkey PRIMARY KEY (id),
  CONSTRAINT promotions_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.qr_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  qr_token_id uuid NOT NULL,
  action text NOT NULL CHECK (action = ANY (ARRAY['scanned'::text, 'validated'::text, 'revoked'::text, 'expired'::text, 'used'::text])),
  user_id uuid,
  venue_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT qr_logs_pkey PRIMARY KEY (id),
  CONSTRAINT qrlogs_qr_fk FOREIGN KEY (qr_token_id) REFERENCES public.qr_tokens(id),
  CONSTRAINT qrlogs_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT qrlogs_venue_fk FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.qr_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['checkin'::character varying, 'promo'::character varying, 'invite'::character varying, 'other'::character varying]::text[])),
  scope character varying NOT NULL,
  venue_id uuid NOT NULL,
  promotion_id uuid,
  campaign_key character varying,
  valid_from timestamp with time zone NOT NULL DEFAULT now(),
  valid_until timestamp with time zone NOT NULL,
  max_uses integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  is_revoked boolean NOT NULL DEFAULT false,
  revoked_at timestamp with time zone,
  revoked_by uuid,
  revoked_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  last_used_at timestamp with time zone,
  last_used_by uuid,
  meta jsonb DEFAULT '{}'::jsonb,
  reward_unit_id uuid,
  CONSTRAINT qr_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT qr_tokens_revoked_by_fkey FOREIGN KEY (revoked_by) REFERENCES public.profiles(id),
  CONSTRAINT qr_tokens_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT qr_tokens_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id),
  CONSTRAINT qr_tokens_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT qr_tokens_last_used_by_fkey FOREIGN KEY (last_used_by) REFERENCES public.profiles(id),
  CONSTRAINT qr_tokens_reward_unit_id_fkey FOREIGN KEY (reward_unit_id) REFERENCES public.reward_units(id)
);
CREATE TABLE public.redemptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  promotion_id uuid,
  reward_unit_id uuid,
  qr_token_id uuid,
  points_spent integer DEFAULT 0,
  status text NOT NULL DEFAULT 'confirmed'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text])),
  created_at timestamp with time zone DEFAULT now(),
  confirmed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT redemptions_pkey PRIMARY KEY (id),
  CONSTRAINT redemptions_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT redemptions_venue_fk FOREIGN KEY (venue_id) REFERENCES public.venues(id),
  CONSTRAINT redemptions_promo_fk FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT redemptions_unit_fk FOREIGN KEY (reward_unit_id) REFERENCES public.reward_units(id),
  CONSTRAINT redemptions_qr_fk FOREIGN KEY (qr_token_id) REFERENCES public.qr_tokens(id)
);
CREATE TABLE public.regions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  country_code character,
  name text NOT NULL,
  CONSTRAINT regions_pkey PRIMARY KEY (id),
  CONSTRAINT regions_country_code_fkey FOREIGN KEY (country_code) REFERENCES public.countries(code)
);
CREATE TABLE public.review_reactions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  review_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type character varying DEFAULT 'helpful'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT review_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT review_reactions_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id),
  CONSTRAINT review_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL,
  user_id uuid NOT NULL,
  checkin_id bigint,
  general_score numeric NOT NULL CHECK (general_score >= 1::numeric AND general_score <= 5::numeric),
  sub_scores jsonb,
  comment text,
  media_urls ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  helpful_count integer DEFAULT 0,
  report_count integer DEFAULT 0,
  owner_response text,
  owner_responded_at timestamp with time zone,
  owner_responded_by uuid,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT reviews_checkin_id_fkey FOREIGN KEY (checkin_id) REFERENCES public.checkins(id),
  CONSTRAINT reviews_owner_responded_by_fkey FOREIGN KEY (owner_responded_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.reward_units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  user_id uuid,
  qr_token_id uuid,
  status text NOT NULL DEFAULT 'available'::text CHECK (status = ANY (ARRAY['available'::text, 'reserved'::text, 'consumed'::text, 'expired'::text])),
  assigned_at timestamp with time zone,
  consumed_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  checkin_id bigint,
  CONSTRAINT reward_units_pkey PRIMARY KEY (id),
  CONSTRAINT reward_units_checkin_id_fkey FOREIGN KEY (checkin_id) REFERENCES public.checkins(id),
  CONSTRAINT reward_units_promo_fk FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT reward_units_venue_fk FOREIGN KEY (venue_id) REFERENCES public.venues(id),
  CONSTRAINT reward_units_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT reward_units_qr_fk FOREIGN KEY (qr_token_id) REFERENCES public.qr_tokens(id)
);
CREATE TABLE public.spatial_ref_sys (
  srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
  auth_name character varying,
  auth_srid integer,
  srtext character varying,
  proj4text character varying,
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
CREATE TABLE public.tag_categories (
  id integer NOT NULL DEFAULT nextval('tag_categories_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  description text,
  CONSTRAINT tag_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tags (
  id integer NOT NULL DEFAULT nextval('tags_id_seq'::regclass),
  name character varying NOT NULL,
  category_id integer,
  icon_slug character varying,
  CONSTRAINT tags_pkey PRIMARY KEY (id),
  CONSTRAINT tags_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.tag_categories(id)
);
CREATE TABLE public.user_badges (
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL,
  awarded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_badges_pkey PRIMARY KEY (user_id, badge_id),
  CONSTRAINT user_badges_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_badges_badge_fk FOREIGN KEY (badge_id) REFERENCES public.badges(id)
);
CREATE TABLE public.user_challenge_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL,
  current_value integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  last_updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_challenge_progress_pkey PRIMARY KEY (id),
  CONSTRAINT ucp_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT ucp_challenge_fk FOREIGN KEY (challenge_id) REFERENCES public.challenges(id)
);
CREATE TABLE public.user_devices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  expo_token character varying NOT NULL UNIQUE,
  platform character varying,
  last_used_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_devices_pkey PRIMARY KEY (id),
  CONSTRAINT user_devices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_favorite_venues (
  user_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_favorite_venues_pkey PRIMARY KEY (user_id, venue_id),
  CONSTRAINT user_fav_venue_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_fav_venue_venue_fk FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.venue_categories (
  id integer NOT NULL DEFAULT nextval('venue_categories_id_seq'::regclass),
  name character varying NOT NULL,
  icon_slug character varying,
  CONSTRAINT venue_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.venue_points_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL,
  delta integer NOT NULL,
  reason character varying NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT venue_points_logs_pkey PRIMARY KEY (id),
  CONSTRAINT venue_points_logs_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id)
);
CREATE TABLE public.venue_tags (
  venue_id uuid NOT NULL,
  tag_id integer NOT NULL,
  CONSTRAINT venue_tags_pkey PRIMARY KEY (venue_id, tag_id),
  CONSTRAINT venue_tags_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id),
  CONSTRAINT venue_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);
CREATE TABLE public.venue_team (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role_id integer,
  is_active boolean DEFAULT true,
  CONSTRAINT venue_team_pkey PRIMARY KEY (id),
  CONSTRAINT venue_team_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id),
  CONSTRAINT venue_team_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT venue_team_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.app_roles(id)
);
CREATE TABLE public.venues (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  legal_name character varying,
  name character varying NOT NULL,
  slug character varying UNIQUE,
  slogan character varying,
  overview text,
  category_id integer,
  logo_url text,
  cover_image_urls jsonb DEFAULT '[]'::jsonb,
  location USER-DEFINED NOT NULL,
  latitude double precision,
  longitude double precision,
  geohash character varying,
  address_display character varying,
  address_street character varying,
  address_number character varying,
  city character varying,
  region_state character varying,
  country_code character varying,
  timezone character varying,
  google_place_id character varying,
  directions_tip text,
  opening_hours jsonb,
  operational_status character varying DEFAULT 'open'::character varying CHECK (operational_status::text = ANY (ARRAY['open'::character varying, 'temporarily_closed'::character varying, 'closed_permanently'::character varying]::text[])),
  price_tier smallint CHECK (price_tier >= 1 AND price_tier <= 4),
  avg_price_min integer,
  avg_price_max integer,
  currency_code character varying DEFAULT 'CLP'::character varying,
  payment_methods jsonb DEFAULT '{"cash": true}'::jsonb,
  amenities jsonb,
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  verified_visits_all_time integer DEFAULT 0,
  verified_visits_monthly integer DEFAULT 0,
  trust_tier character varying DEFAULT 'standard'::character varying,
  rating_average numeric DEFAULT 0.00,
  review_count integer DEFAULT 0,
  seo_title character varying,
  seo_description character varying,
  search_vector tsvector DEFAULT (setweight(to_tsvector('spanish'::regconfig, (COALESCE(name, ''::character varying))::text), 'A'::"char") || setweight(to_tsvector('spanish'::regconfig, COALESCE(overview, ''::text)), 'B'::"char")),
  features_config jsonb DEFAULT '{"chat": false}'::jsonb,
  admin_notes text,
  owner_id uuid,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  verification_status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (verification_status::text = ANY (ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying]::text[])),
  is_founder_venue boolean DEFAULT false,
  company_tax_id character varying,
  ownership_proof_url text,
  connectivity_features jsonb DEFAULT '[]'::jsonb,
  accessibility_features jsonb DEFAULT '[]'::jsonb,
  space_features jsonb DEFAULT '[]'::jsonb,
  comfort_features jsonb DEFAULT '[]'::jsonb,
  audience_features jsonb DEFAULT '[]'::jsonb,
  entertainment_features jsonb DEFAULT '[]'::jsonb,
  dietary_options jsonb DEFAULT '[]'::jsonb,
  access_features jsonb DEFAULT '[]'::jsonb,
  security_features jsonb DEFAULT '[]'::jsonb,
  mood_tags jsonb DEFAULT '[]'::jsonb,
  occasion_tags jsonb DEFAULT '[]'::jsonb,
  music_profile jsonb DEFAULT '{}'::jsonb,
  crowd_profile jsonb DEFAULT '{}'::jsonb,
  capacity_estimate smallint,
  seated_capacity smallint,
  standing_allowed boolean DEFAULT false,
  noise_level character varying CHECK (noise_level IS NULL OR (noise_level::text = ANY (ARRAY['quiet'::character varying, 'moderate'::character varying, 'loud'::character varying]::text[]))),
  pricing_profile jsonb DEFAULT '{}'::jsonb,
  menu_media_urls jsonb DEFAULT '[]'::jsonb,
  menu_last_updated_at timestamp with time zone,
  referral_code text UNIQUE,
  referred_by_user_id uuid,
  referred_by_venue_id uuid,
  is_operational boolean DEFAULT true,
  contact_phone character varying,
  contact_email character varying,
  website text,
  points_balance integer NOT NULL DEFAULT 0,
  last_read_reviews_at timestamp with time zone,
  favorites_count integer DEFAULT 0,
  CONSTRAINT venues_pkey PRIMARY KEY (id),
  CONSTRAINT venues_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.venue_categories(id),
  CONSTRAINT venues_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id),
  CONSTRAINT venues_referred_by_user_fk FOREIGN KEY (referred_by_user_id) REFERENCES public.profiles(id),
  CONSTRAINT venues_referred_by_venue_fk FOREIGN KEY (referred_by_venue_id) REFERENCES public.venues(id)
);
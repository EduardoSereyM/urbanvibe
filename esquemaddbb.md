


# IMPORTANTE: ESTE ARCHIVO SE DEBE MANTENER ACTUALIZADO CON CADA CAMBIO EN LA API
# ULTIMA ACTUALIZACION: 21/01/2026 12:15 PM



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
  group_id uuid,
  CONSTRAINT checkins_pkey PRIMARY KEY (id),
  CONSTRAINT checkins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT checkins_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id),
  CONSTRAINT checkins_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.profiles(id),
  CONSTRAINT checkins_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.qr_tokens(id),
  CONSTRAINT checkins_group_fk FOREIGN KEY (group_id) REFERENCES public.groups(id)
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
CREATE TABLE public.friendships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'blocked'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT friendships_pkey PRIMARY KEY (id),
  CONSTRAINT friendships_user_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT friendships_friend_fkey FOREIGN KEY (friend_id) REFERENCES public.profiles(id)
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
CREATE TABLE public.group_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  inviter_id uuid NOT NULL,
  invitee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'cancelled'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT group_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT group_invitations_group_fk FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT group_invitations_inviter_fk FOREIGN KEY (inviter_id) REFERENCES public.profiles(id),
  CONSTRAINT group_invitations_invitee_fk FOREIGN KEY (invitee_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.group_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text,
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT group_members_pkey PRIMARY KEY (id),
  CONSTRAINT group_members_group_fk FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT group_members_user_fk FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  avatar_url text,
  creator_id uuid NOT NULL,
  is_private boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT groups_pkey PRIMARY KEY (id),
  CONSTRAINT groups_creator_fk FOREIGN KEY (creator_id) REFERENCES public.profiles(id)
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
CREATE TABLE public.venue_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  friend_id uuid,
  venue_id uuid NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  group_id uuid,
  CONSTRAINT venue_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT venue_invitations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT venue_invitations_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES public.profiles(id),
  CONSTRAINT venue_invitations_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id),
  CONSTRAINT venue_invitations_group_fk FOREIGN KEY (group_id) REFERENCES public.groups(id)
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






-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE audit.change_logs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  table_name text NOT NULL,
  record_id text NOT NULL,
  operation text NOT NULL,
  changed_by uuid,
  old_values jsonb,
  new_values jsonb,
  changed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT change_logs_pkey PRIMARY KEY (id)
);





-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE auth.audit_log_entries (
  instance_id uuid,
  id uuid NOT NULL,
  payload json,
  created_at timestamp with time zone,
  ip_address character varying NOT NULL DEFAULT ''::character varying,
  CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id)
);
CREATE TABLE auth.flow_state (
  id uuid NOT NULL,
  user_id uuid,
  auth_code text NOT NULL,
  code_challenge_method USER-DEFINED NOT NULL,
  code_challenge text NOT NULL,
  provider_type text NOT NULL,
  provider_access_token text,
  provider_refresh_token text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  authentication_method text NOT NULL,
  auth_code_issued_at timestamp with time zone,
  CONSTRAINT flow_state_pkey PRIMARY KEY (id)
);
CREATE TABLE auth.identities (
  provider_id text NOT NULL,
  user_id uuid NOT NULL,
  identity_data jsonb NOT NULL,
  provider text NOT NULL,
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  email text DEFAULT lower((identity_data ->> 'email'::text)),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT identities_pkey PRIMARY KEY (id),
  CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE auth.instances (
  id uuid NOT NULL,
  uuid uuid,
  raw_base_config text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  CONSTRAINT instances_pkey PRIMARY KEY (id)
);
CREATE TABLE auth.mfa_amr_claims (
  session_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  authentication_method text NOT NULL,
  id uuid NOT NULL,
  CONSTRAINT mfa_amr_claims_pkey PRIMARY KEY (id),
  CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id)
);
CREATE TABLE auth.mfa_challenges (
  id uuid NOT NULL,
  factor_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL,
  verified_at timestamp with time zone,
  ip_address inet NOT NULL,
  otp_code text,
  web_authn_session_data jsonb,
  CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id),
  CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id)
);
CREATE TABLE auth.mfa_factors (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  friendly_name text,
  factor_type USER-DEFINED NOT NULL,
  status USER-DEFINED NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  secret text,
  phone text,
  last_challenged_at timestamp with time zone UNIQUE,
  web_authn_credential jsonb,
  web_authn_aaguid uuid,
  last_webauthn_challenge_data jsonb,
  CONSTRAINT mfa_factors_pkey PRIMARY KEY (id),
  CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE auth.oauth_authorizations (
  id uuid NOT NULL,
  authorization_id text NOT NULL UNIQUE,
  client_id uuid NOT NULL,
  user_id uuid,
  redirect_uri text NOT NULL CHECK (char_length(redirect_uri) <= 2048),
  scope text NOT NULL CHECK (char_length(scope) <= 4096),
  state text CHECK (char_length(state) <= 4096),
  resource text CHECK (char_length(resource) <= 2048),
  code_challenge text CHECK (char_length(code_challenge) <= 128),
  code_challenge_method USER-DEFINED,
  response_type USER-DEFINED NOT NULL DEFAULT 'code'::auth.oauth_response_type,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::auth.oauth_authorization_status,
  authorization_code text UNIQUE CHECK (char_length(authorization_code) <= 255),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '00:03:00'::interval),
  approved_at timestamp with time zone,
  nonce text CHECK (char_length(nonce) <= 255),
  CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id),
  CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id),
  CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE auth.oauth_client_states (
  id uuid NOT NULL,
  provider_type text NOT NULL,
  code_verifier text,
  created_at timestamp with time zone NOT NULL,
  CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id)
);
CREATE TABLE auth.oauth_clients (
  id uuid NOT NULL,
  client_secret_hash text,
  registration_type USER-DEFINED NOT NULL,
  redirect_uris text NOT NULL,
  grant_types text NOT NULL,
  client_name text CHECK (char_length(client_name) <= 1024),
  client_uri text CHECK (char_length(client_uri) <= 2048),
  logo_uri text CHECK (char_length(logo_uri) <= 2048),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  client_type USER-DEFINED NOT NULL DEFAULT 'confidential'::auth.oauth_client_type,
  CONSTRAINT oauth_clients_pkey PRIMARY KEY (id)
);
CREATE TABLE auth.oauth_consents (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  client_id uuid NOT NULL,
  scopes text NOT NULL CHECK (char_length(scopes) <= 2048),
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  revoked_at timestamp with time zone,
  CONSTRAINT oauth_consents_pkey PRIMARY KEY (id),
  CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id)
);
CREATE TABLE auth.one_time_tokens (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  token_type USER-DEFINED NOT NULL,
  token_hash text NOT NULL CHECK (char_length(token_hash) > 0),
  relates_to text NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE auth.refresh_tokens (
  instance_id uuid,
  id bigint NOT NULL DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass),
  token character varying UNIQUE,
  user_id character varying,
  revoked boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  parent character varying,
  session_id uuid,
  CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id)
);
CREATE TABLE auth.saml_providers (
  id uuid NOT NULL,
  sso_provider_id uuid NOT NULL,
  entity_id text NOT NULL UNIQUE CHECK (char_length(entity_id) > 0),
  metadata_xml text NOT NULL CHECK (char_length(metadata_xml) > 0),
  metadata_url text CHECK (metadata_url = NULL::text OR char_length(metadata_url) > 0),
  attribute_mapping jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  name_id_format text,
  CONSTRAINT saml_providers_pkey PRIMARY KEY (id),
  CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id)
);
CREATE TABLE auth.saml_relay_states (
  id uuid NOT NULL,
  sso_provider_id uuid NOT NULL,
  request_id text NOT NULL CHECK (char_length(request_id) > 0),
  for_email text,
  redirect_to text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  flow_state_id uuid,
  CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id),
  CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id),
  CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id)
);
CREATE TABLE auth.schema_migrations (
  version character varying NOT NULL,
  CONSTRAINT schema_migrations_pkey PRIMARY KEY (version)
);
CREATE TABLE auth.sessions (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  factor_id uuid,
  aal USER-DEFINED,
  not_after timestamp with time zone,
  refreshed_at timestamp without time zone,
  user_agent text,
  ip inet,
  tag text,
  oauth_client_id uuid,
  refresh_token_hmac_key text,
  refresh_token_counter bigint,
  scopes text CHECK (char_length(scopes) <= 4096),
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id)
);
CREATE TABLE auth.sso_domains (
  id uuid NOT NULL,
  sso_provider_id uuid NOT NULL,
  domain text NOT NULL CHECK (char_length(domain) > 0),
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  CONSTRAINT sso_domains_pkey PRIMARY KEY (id),
  CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id)
);
CREATE TABLE auth.sso_providers (
  id uuid NOT NULL,
  resource_id text CHECK (resource_id = NULL::text OR char_length(resource_id) > 0),
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  disabled boolean,
  CONSTRAINT sso_providers_pkey PRIMARY KEY (id)
);
CREATE TABLE auth.users (
  instance_id uuid,
  id uuid NOT NULL,
  aud character varying,
  role character varying,
  email character varying,
  encrypted_password character varying,
  email_confirmed_at timestamp with time zone,
  invited_at timestamp with time zone,
  confirmation_token character varying,
  confirmation_sent_at timestamp with time zone,
  recovery_token character varying,
  recovery_sent_at timestamp with time zone,
  email_change_token_new character varying,
  email_change character varying,
  email_change_sent_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  phone text DEFAULT NULL::character varying UNIQUE,
  phone_confirmed_at timestamp with time zone,
  phone_change text DEFAULT ''::character varying,
  phone_change_token character varying DEFAULT ''::character varying,
  phone_change_sent_at timestamp with time zone,
  confirmed_at timestamp with time zone DEFAULT LEAST(email_confirmed_at, phone_confirmed_at),
  email_change_token_current character varying DEFAULT ''::character varying,
  email_change_confirm_status smallint DEFAULT 0 CHECK (email_change_confirm_status >= 0 AND email_change_confirm_status <= 2),
  banned_until timestamp with time zone,
  reauthentication_token character varying DEFAULT ''::character varying,
  reauthentication_sent_at timestamp with time zone,
  is_sso_user boolean NOT NULL DEFAULT false,
  deleted_at timestamp with time zone,
  is_anonymous boolean NOT NULL DEFAULT false,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);





-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE billing.plans (
  id character varying NOT NULL,
  name character varying,
  price integer CHECK (price >= 0),
  features jsonb NOT NULL,
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);
CREATE TABLE billing.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL,
  plan_id character varying,
  status character varying NOT NULL CHECK (status::text = ANY (ARRAY['trialing'::character varying, 'active'::character varying, 'past_due'::character varying, 'canceled'::character varying, 'incomplete'::character varying, 'unpaid'::character varying, 'paused'::character varying]::text[])),
  current_period_end timestamp with time zone,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id),
  CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES billing.plans(id)
);







-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE gamification.levels (
  id integer NOT NULL DEFAULT nextval('gamification.levels_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  min_points integer NOT NULL UNIQUE,
  icon_url text,
  perks jsonb,
  CONSTRAINT levels_pkey PRIMARY KEY (id)
);
CREATE TABLE gamification.points_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL CHECK (amount <> 0),
  transaction_type character varying,
  source_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT points_ledger_pkey PRIMARY KEY (id),
  CONSTRAINT points_ledger_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);




-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE realtime.messages (
  topic text NOT NULL,
  extension text NOT NULL,
  payload jsonb,
  event text,
  private boolean DEFAULT false,
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  inserted_at timestamp without time zone NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at)
);
CREATE TABLE realtime.schema_migrations (
  version bigint NOT NULL,
  inserted_at timestamp without time zone,
  CONSTRAINT schema_migrations_pkey PRIMARY KEY (version)
);
CREATE TABLE realtime.subscription (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  subscription_id uuid NOT NULL,
  entity regclass NOT NULL,
  filters ARRAY NOT NULL DEFAULT '{}'::realtime.user_defined_filter[],
  claims jsonb NOT NULL,
  claims_role regrole NOT NULL DEFAULT realtime.to_regrole((claims ->> 'role'::text)),
  created_at timestamp without time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT subscription_pkey PRIMARY KEY (id)
);






-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE storage.buckets (
  id text NOT NULL,
  name text NOT NULL,
  owner uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  public boolean DEFAULT false,
  avif_autodetection boolean DEFAULT false,
  file_size_limit bigint,
  allowed_mime_types ARRAY,
  owner_id text,
  type USER-DEFINED NOT NULL DEFAULT 'STANDARD'::storage.buckettype,
  CONSTRAINT buckets_pkey PRIMARY KEY (id)
);
CREATE TABLE storage.buckets_analytics (
  name text NOT NULL,
  type USER-DEFINED NOT NULL DEFAULT 'ANALYTICS'::storage.buckettype,
  format text NOT NULL DEFAULT 'ICEBERG'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  deleted_at timestamp with time zone,
  CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id)
);
CREATE TABLE storage.buckets_vectors (
  id text NOT NULL,
  type USER-DEFINED NOT NULL DEFAULT 'VECTOR'::storage.buckettype,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id)
);
CREATE TABLE storage.migrations (
  id integer NOT NULL,
  name character varying NOT NULL UNIQUE,
  hash character varying NOT NULL,
  executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT migrations_pkey PRIMARY KEY (id)
);
CREATE TABLE storage.objects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  bucket_id text,
  name text,
  owner uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_accessed_at timestamp with time zone DEFAULT now(),
  metadata jsonb,
  path_tokens ARRAY DEFAULT string_to_array(name, '/'::text),
  version text,
  owner_id text,
  user_metadata jsonb,
  level integer,
  CONSTRAINT objects_pkey PRIMARY KEY (id),
  CONSTRAINT objects_bucketId_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)
);
CREATE TABLE storage.prefixes (
  bucket_id text NOT NULL,
  name text NOT NULL,
  level integer NOT NULL DEFAULT storage.get_level(name),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name),
  CONSTRAINT prefixes_bucketId_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)
);
CREATE TABLE storage.s3_multipart_uploads (
  id text NOT NULL,
  in_progress_size bigint NOT NULL DEFAULT 0,
  upload_signature text NOT NULL,
  bucket_id text NOT NULL,
  key text NOT NULL,
  version text NOT NULL,
  owner_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_metadata jsonb,
  CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id),
  CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)
);
CREATE TABLE storage.s3_multipart_uploads_parts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  upload_id text NOT NULL,
  size bigint NOT NULL DEFAULT 0,
  part_number integer NOT NULL,
  bucket_id text NOT NULL,
  key text NOT NULL,
  etag text NOT NULL,
  owner_id text,
  version text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id),
  CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id),
  CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)
);
CREATE TABLE storage.vector_indexes (
  id text NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bucket_id text NOT NULL,
  data_type text NOT NULL,
  dimension integer NOT NULL,
  distance_metric text NOT NULL,
  metadata_configuration jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vector_indexes_pkey PRIMARY KEY (id),
  CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id)
);







-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE vault.secrets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  description text NOT NULL DEFAULT ''::text,
  secret text NOT NULL,
  key_id uuid,
  nonce bytea DEFAULT vault._crypto_aead_det_noncegen(),
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT secrets_pkey PRIMARY KEY (id)
);
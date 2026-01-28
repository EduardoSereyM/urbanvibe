// src/api/client.ts

import axios from 'axios';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// ⚠️ IMPORTANTE: El fallback DEBE ser la URL de producción (Render)
// Las variables de entorno pueden no embeberse correctamente en builds de release.
// Si necesitas conectar a tu backend local, cambia temporalmente esta línea.
const PRODUCTION_URL = 'https://backenduv.onrender.com';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || PRODUCTION_URL;

console.log('🔌 [DEBUG] Client BASE_URL configured to:', BASE_URL);
console.log('📱 [DEBUG] Platform OS:', Platform.OS);
console.log('🌐 [DEBUG] EXPO_PUBLIC_API_URL env:', process.env.EXPO_PUBLIC_API_URL || '(not set, using fallback)');

export const client = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ✅ Incluir token automáticamente EN TODAS las requests
client.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
  return config;
});

// ✅ Interceptor de Respuesta: Maneja 401 (Token Expirado/Inválido)
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si recibimos un 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('⚠️ [API] 401 Detectado - Cerrando sesión local...');

      // Intentamos cerrar sesión en Supabase para limpiar el storage
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Error signing out:', e);
      }

      // Opcional: Podríamos emitir un evento para que la UI reaccione y navegue al login
      // Pero como AuthLayout escucha "onAuthStateChange", el signOut debería bastar.
    }
    return Promise.reject(error);
  }
);

export async function registerDeviceToken(token: string, platform: string) {
  try {
    await client.post('/notifications/device', { token, platform });
  } catch (error) {
    console.error('Error registering device token:', error);
    // Fail silently to avoid interrupting app flow
  }
}

// ============================================================================
// B2B API Functions - Venue Administration
// ============================================================================

import {
  MyVenuesResponse,
  VenueB2BDetail,
  VenueCreatePayload,
  VenueQRResponse,
  VenueCheckinListResponse,
  VenueCheckinDetail,
  AdminMetricsResponse,
  AdminUserDetailResponse,
  AdminUsersFilters,
  AdminUsersListResponse,
  AdminUserUpdatePayload,
  AdminVenueDetailResponse,
  AdminVenuesFilters,
  AdminVenuesListResponse,
  AdminVenueUpdatePayload,
  UserPromotionResponse,
  ClaimResponse,
  WalletItemResponse,
  CheckinResponse,
  ReviewsListResponse,
  Review,
  ContentReport,
  Promotion,
  VenuePointsLog,
  RewardUnit,
  ProfileUpdatePayload,
} from './types';

export async function fetchMyAdminVenues(): Promise<MyVenuesResponse> {
  const { data } = await client.get<MyVenuesResponse>('/venues-admin/me/venues');
  return data;
}

export async function createAdminVenue(payload: VenueCreatePayload): Promise<VenueB2BDetail> {
  const { data } = await client.post<VenueB2BDetail>('/venues-admin/venues', payload);
  return data;
}

export async function fetchAdminVenueDetail(venueId: string): Promise<VenueB2BDetail> {
  const { data } = await client.get<VenueB2BDetail>(`/venues-admin/venues/${venueId}`);
  return data;
}

export async function updateVenue(venueId: string, payload: VenueCreatePayload): Promise<VenueB2BDetail> {
  const { data } = await client.patch<VenueB2BDetail>(`/venues-admin/venues/${venueId}`, payload);
  return data;
}

export async function generateCheckInQR(venueId: string) {
  // Use admin endpoint for QR generation
  const { data } = await client.post<VenueQRResponse>(`/venues-admin/venues/${venueId}/qr-checkin`);
  return data;
}

export async function updateProfile(data: ProfileUpdatePayload) {
  const response = await client.patch('/profiles/me', data);
  return response.data;
}

export async function fetchVenueCheckins(venueId: string): Promise<VenueCheckinListResponse> {
  const { data } = await client.get<VenueCheckinListResponse>(`/venues-admin/venues/${venueId}/checkins`);
  return data;
}

export async function fetchVenueReviews(venueId: string, skip = 0, limit = 20): Promise<ReviewsListResponse> {
  const { data } = await client.get<ReviewsListResponse>(`/venues-admin/venues/${venueId}/reviews`, {
    params: { skip, limit }
  });
  return data;
}

export async function replyToReview(venueId: string, reviewId: string, response: string): Promise<Review> {
  // Using the new dedicated reviews router
  const { data } = await client.patch<Review>(`/reviews/${reviewId}/reply`, {
    response
  });
  return data;
}

export async function reactToReview(reviewId: string, reactionType: string = 'helpful'): Promise<{ message: string; helpful_count: number }> {
  const { data } = await client.post<{ message: string; helpful_count: number }>(`/reviews/${reviewId}/react`, {
    reaction_type: reactionType
  });
  return data;
}

export async function reportReview(reviewId: string, reason: string, details?: string): Promise<ContentReport> {
  const { data } = await client.post<ContentReport>('/reviews/reports', {
    target_type: 'review',
    target_id: reviewId,
    reason,
    details
  });
  return data;
}

export async function fetchVenuePromotions(venueId: string): Promise<Promotion[]> {
  const { data } = await client.get<Promotion[]>(`/venues-admin/venues/${venueId}/promotions`);
  return data;
}

export async function createPromotion(venueId: string, payload: Partial<Promotion>): Promise<Promotion> {
  const { data } = await client.post<Promotion>(`/venues-admin/venues/${venueId}/promotions`, payload);
  return data;
}

export async function fetchVenuePointsLogs(venueId: string): Promise<VenuePointsLog[]> {
  const { data } = await client.get<VenuePointsLog[]>(`/venues-admin/venues/${venueId}/points-logs`);
  return data;
}

export async function validateRewardQR(venueId: string, qrContent: string): Promise<{ success: boolean; message: string; points_earned?: number }> {
  const { data } = await client.post<{ success: boolean; message: string; points_earned?: number }>(`/venues-admin/venues/${venueId}/validate-reward`, {
    qr_content: qrContent
  });
  return data;
}

export async function markReviewsAsRead(venueId: string): Promise<void> {
  await client.post(`/venues-admin/venues/${venueId}/reviews/mark-read`);
}

// ============================================================================
// User Promotions API
// ============================================================================

export async function fetchVenuePromotionsUser(venueId: string): Promise<UserPromotionResponse[]> {
  const { data } = await client.get<UserPromotionResponse[]>(`/promotions/venues/${venueId}/promotions`);
  return data;
}

export async function claimPromotion(promotionId: string): Promise<ClaimResponse> {
  const { data } = await client.post<ClaimResponse>(`/promotions/promotions/${promotionId}/claim`);
  return data;
}

export async function fetchMyWallet(): Promise<WalletItemResponse[]> {
  const { data } = await client.get<WalletItemResponse[]>('/promotions/me/wallet');
  return data;
}

// ============================================================================
// Admin API Functions - SUPER_ADMIN Only
// ============================================================================

export async function fetchAdminVenuesList(filters?: AdminVenuesFilters): Promise<AdminVenuesListResponse> {
  const { data } = await client.get<AdminVenuesListResponse>('/admin/venues', {
    params: filters,
  });
  return data;
}

export async function fetchAdminVenueDetailById(venueId: string): Promise<AdminVenueDetailResponse> {
  const { data } = await client.get<AdminVenueDetailResponse>(`/admin/venues/${venueId}`);
  return data;
}

export async function updateAdminVenue(venueId: string, payload: AdminVenueUpdatePayload): Promise<AdminVenueDetailResponse> {
  const { data } = await client.patch<AdminVenueDetailResponse>(`/admin/venues/${venueId}`, payload);
  return data;
}

export async function fetchAdminUsersList(filters?: AdminUsersFilters): Promise<AdminUsersListResponse> {
  const { data } = await client.get<AdminUsersListResponse>('/admin/users', {
    params: filters,
  });
  return data;
}

export async function fetchAdminUserDetailById(userId: string): Promise<AdminUserDetailResponse> {
  const { data } = await client.get<AdminUserDetailResponse>(`/admin/users/${userId}`);
  return data;
}

export async function updateAdminUser(userId: string, payload: AdminUserUpdatePayload): Promise<AdminUserDetailResponse> {
  const { data } = await client.patch<AdminUserDetailResponse>(`/admin/users/${userId}`, payload);
  return data;
}

export async function fetchAdminMetrics(period?: '24h' | '7d' | '30d' | '90d' | 'all'): Promise<AdminMetricsResponse> {
  const { data } = await client.get<AdminMetricsResponse>('/admin/metrics', {
    params: { period },
  });
  return data;
}

export const fetchMyCheckins = async (): Promise<CheckinResponse[]> => {
  const { data } = await client.get('/checkins/me');
  return data;
};

export const confirmCheckin = async (venueId: string, checkinId: number): Promise<VenueCheckinDetail> => {
  const { data } = await client.put(`/venues-admin/venues/${venueId}/checkins/${checkinId}/status`, {
    status: 'confirmed',
  });
  return data;
};

// ============================================================================
// Gamification & Wallet API
// ============================================================================

export async function fetchPointHistory(skip = 0, limit = 50) {
  const { data } = await client.get('/gamification/my-history', {
    params: { skip, limit }
  });
  return data;
}

export async function fetchPointStats() {
  const { data } = await client.get('/gamification/my-stats');
  return data;
}

// ============================================================================
// Groups API (V14)
// ============================================================================

export async function fetchMyGroups() {
  const { data } = await client.get('/groups/my-groups');
  return data;
}

export async function createGroup(payload: { name: string; description?: string; is_private?: boolean }) {
  const { data } = await client.post('/groups/', payload);
  return data;
}

export async function fetchGroupDetails(groupId: string) {
  const { data } = await client.get(`/groups/${groupId}`);
  return data;
}

export async function fetchGroupMembers(groupId: string) {
  const { data } = await client.get(`/groups/${groupId}/members`);
  return data;
}

export async function inviteToGroup(groupId: string, inviteeId: string) {
  const { data } = await client.post(`/groups/${groupId}/invite`, { invitee_id: inviteeId });
  return data;
}

export async function fetchReceivedGroupInvitations() {
  const { data } = await client.get('/groups/invitations/received');
  return data;
}

export async function handleGroupInvitation(invitationId: string, action: 'accept' | 'reject') {
  const { data } = await client.patch(`/groups/invitations/${invitationId}/action`, { action });
  return data;
}

export async function removeGroupMember(groupId: string, userId: string) {
  const { data } = await client.delete(`/groups/${groupId}/members/${userId}`);
  return data;
}

export async function fetchUserGroups(userId: string) {
  const { data } = await client.get(`/groups/profile/${userId}`);
  return data;
}

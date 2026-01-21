import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPointHistory, fetchPointStats, fetchMyGroups, createGroup, fetchGroupDetails, fetchGroupMembers, inviteToGroup, fetchReceivedGroupInvitations, handleGroupInvitation, removeGroupMember, fetchUserGroups, client as api } from '../api/client';

export interface UserSearchResponse {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    referral_code?: string;
    current_level_name?: string;
}

export interface FriendListItem {
    friendship_id: string;
    friend_id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    status: 'pending' | 'accepted' | 'rejected';
    is_sender: boolean;
    created_at: string;
}

export interface BadgeItem {
    id: string;
    name: string;
    description?: string;
    icon_url?: string;
}

export interface PublicProfileResponse {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    current_level_name?: string;
    reviews_count: number;
    verified_checkins_count: number;
    badges: BadgeItem[];
    is_friend: boolean;
}

export interface GroupResponse {
    id: string;
    name: string;
    description?: string;
    avatar_url?: string;
    is_private: boolean;
    creator_id: string;
    created_at: string;
}

export interface GroupInvitationResponse {
    id: string;
    group_id: string;
    group_name: string;
    inviter_id: string;
    inviter_username: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    created_at: string;
}

export const useSocial = () => {
    const queryClient = useQueryClient();

    // Búsqueda de usuarios (Solo exacta por correo o ID)
    const useSearchUsers = (query: string) => {
        return useQuery({
            queryKey: ['users-search', query],
            queryFn: async () => {
                if (query.length < 3) return [];
                const { data } = await api.get<UserSearchResponse[]>(`/friends/search`, {
                    params: { query }
                });
                return data;
            },
            enabled: query.length >= 3,
        });
    };

    // Lista de amigos y solicitudes
    const useFriendsList = () => {
        return useQuery({
            queryKey: ['friends-list'],
            queryFn: async () => {
                const { data } = await api.get<FriendListItem[]>('/friends/list');
                return data;
            },
        });
    };

    // Enviar solicitud de amistad
    const useSendFriendRequest = () => {
        return useMutation({
            mutationFn: async (friendId: string) => {
                const { data } = await api.post(`/friends/request/${friendId}`);
                return data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['friends-list'] });
            },
        });
    };

    // Aceptar o rechazar solicitud (CON OPTIMISTIC UPDATE)
    const useHandleFriendRequest = () => {
        return useMutation({
            mutationFn: async ({ friendshipId, action }: { friendshipId: string; action: 'accept' | 'reject' }) => {
                const { data } = await api.patch(`/friends/requests/${friendshipId}/action`, { action });
                return data;
            },
            onMutate: async ({ friendshipId, action }) => {
                await queryClient.cancelQueries({ queryKey: ['friends-list'] });
                const previousFriends = queryClient.getQueryData<FriendListItem[]>(['friends-list']);

                if (previousFriends) {
                    queryClient.setQueryData<FriendListItem[]>(['friends-list'], (old) =>
                        old?.map(f => f.friendship_id === friendshipId
                            ? { ...f, status: action === 'accept' ? 'accepted' : 'rejected' }
                            : f
                        )
                    );
                }
                return { previousFriends };
            },
            onError: (err, variables, context) => {
                if (context?.previousFriends) {
                    queryClient.setQueryData(['friends-list'], context.previousFriends);
                }
            },
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: ['friends-list'] });
            },
        });
    };

    // Eliminar amigo
    const useRemoveFriend = () => {
        return useMutation({
            mutationFn: async (friendshipId: string) => {
                const { data } = await api.delete(`/friends/${friendshipId}`);
                return data;
            },
            onMutate: async (friendshipId) => {
                await queryClient.cancelQueries({ queryKey: ['friends-list'] });
                const previousFriends = queryClient.getQueryData<FriendListItem[]>(['friends-list']);
                if (previousFriends) {
                    queryClient.setQueryData<FriendListItem[]>(['friends-list'], (old) =>
                        old?.filter(f => f.friendship_id !== friendshipId)
                    );
                }
                return { previousFriends };
            },
            onError: (err, variables, context) => {
                if (context?.previousFriends) {
                    queryClient.setQueryData(['friends-list'], context.previousFriends);
                }
            },
            onSettled: () => {
                queryClient.invalidateQueries({ queryKey: ['friends-list'] });
            },
        });
    };

    // Obtener Perfil Público
    const usePublicProfile = (userId: string) => {
        return useQuery({
            queryKey: ['public-profile', userId],
            queryFn: async () => {
                const { data } = await api.get<PublicProfileResponse>(`/friends/profile/${userId}`);
                return data;
            },
            enabled: !!userId,
        });
    };

    // --- INVITACIONES A LOCALES (V13.3) ---

    // Enviar invitación a un local
    const useSendVenueInvitation = () => {
        return useMutation({
            mutationFn: async (payload: { friend_id?: string | null; group_id?: string | null; venue_id: string; message?: string }) => {
                const { data } = await api.post('/friends/invite-to-venue', payload);
                return data;
            }
        });
    };

    // Ver invitaciones recibidas (pendientes)
    const useVenueInvitations = () => {
        return useQuery({
            queryKey: ['venue-invitations'],
            queryFn: async () => {
                const { data } = await api.get<any[]>('/friends/venue-invitations');
                return data;
            },
            refetchInterval: 5000, // Polling cada 5s para actualizaciones "en vivo"
        });
    };

    // Listar invitaciones enviadas (historial completo)
    const useSentVenueInvitations = () => {
        return useQuery({
            queryKey: ['venue-invitations-sent'],
            queryFn: async () => {
                const { data } = await api.get<any[]>('/friends/venue-invitations/sent');
                return data;
            },
            refetchInterval: 5000,
        });
    };

    // Listar todas las invitaciones recibidas (historial completo)
    const useReceivedVenueInvitations = () => {
        return useQuery({
            queryKey: ['venue-invitations-received'],
            queryFn: async () => {
                const { data } = await api.get<any[]>('/friends/venue-invitations/received');
                return data;
            },
            refetchInterval: 5000,
        });
    };

    // Aceptar/Rechazar invitación
    const useHandleVenueInvitation = () => {
        return useMutation({
            mutationFn: async ({ invitationId, action }: { invitationId: string; action: 'accept' | 'reject' }) => {
                const { data } = await api.patch(`/friends/venue-invitations/${invitationId}/action`, { action });
                return data;
            },
            onMutate: async ({ invitationId, action }) => {
                // Optimistic Update
                await queryClient.cancelQueries({ queryKey: ['venue-invitations'] });
                await queryClient.cancelQueries({ queryKey: ['venue-invitations-received'] });

                const previousReceived = queryClient.getQueryData<any[]>(['venue-invitations-received']);
                if (previousReceived) {
                    queryClient.setQueryData<any[]>(['venue-invitations-received'], (old) =>
                        old?.map(inv => inv.id === invitationId ? { ...inv, status: action === 'accept' ? 'accepted' : 'rejected' } : inv)
                    );
                }
                return { previousReceived };
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['venue-invitations'] });
                queryClient.invalidateQueries({ queryKey: ['venue-invitations-sent'] });
                queryClient.invalidateQueries({ queryKey: ['venue-invitations-received'] });
                queryClient.invalidateQueries({ queryKey: ['unread-count'] });
            }
        });
    };

    // --- GAMIFICATION & WALLET (V13.4) ---

    // Historial de puntos
    const usePointHistory = (skip = 0, limit = 50) => {
        return useQuery({
            queryKey: ['point-history', skip, limit],
            queryFn: () => fetchPointHistory(skip, limit),
        });
    };

    // Estadísticas de puntos y nivel
    const usePointStats = () => {
        return useQuery({
            queryKey: ['point-stats'],
            queryFn: fetchPointStats,
        });
    };

    // --- GROUPS (V14) ---

    const useMyGroups = () => {
        return useQuery({
            queryKey: ['my-groups'],
            queryFn: fetchMyGroups,
        });
    };

    const useCreateGroup = () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: createGroup,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['my-groups'] });
            },
        });
    };

    const useGroupDetails = (groupId: string) => {
        return useQuery({
            queryKey: ['group-details', groupId],
            queryFn: () => fetchGroupDetails(groupId),
            enabled: !!groupId,
        });
    };

    const useGroupMembers = (groupId: string) => {
        return useQuery({
            queryKey: ['group-members', groupId],
            queryFn: () => fetchGroupMembers(groupId),
            enabled: !!groupId,
        });
    };

    const useInviteToGroup = () => {
        return useMutation({
            mutationFn: ({ groupId, inviteeId }: { groupId: string; inviteeId: string }) =>
                inviteToGroup(groupId, inviteeId),
        });
    };

    const useGroupInvitations = () => {
        return useQuery({
            queryKey: ['group-invitations-received'],
            queryFn: fetchReceivedGroupInvitations,
        });
    };

    const useHandleGroupInvitation = () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: ({ invitationId, action }: { invitationId: string; action: 'accept' | 'reject' }) =>
                handleGroupInvitation(invitationId, action),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['group-invitations-received'] });
                queryClient.invalidateQueries({ queryKey: ['my-groups'] });
            },
        });
    };

    const useRemoveGroupMember = () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
                removeGroupMember(groupId, userId),
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['group-members', variables.groupId] });
            },
        });
    };

    const useUserGroups = (userId: string) => {
        return useQuery({
            queryKey: ['user-groups', userId],
            queryFn: () => fetchUserGroups(userId),
            enabled: !!userId,
        });
    };

    return {
        useSearchUsers,
        useFriendsList,
        useSendFriendRequest,
        useHandleFriendRequest,
        useRemoveFriend,
        usePublicProfile,
        useSendVenueInvitation,
        useVenueInvitations,
        useSentVenueInvitations,
        useReceivedVenueInvitations,
        useHandleVenueInvitation,
        usePointHistory,
        usePointStats,
        useMyGroups,
        useCreateGroup,
        useGroupDetails,
        useGroupMembers,
        useInviteToGroup,
        useGroupInvitations,
        useHandleGroupInvitation,
        useRemoveGroupMember,
        useUserGroups,
    };
};

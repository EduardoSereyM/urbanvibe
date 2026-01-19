// src/hooks/useAdminUsers.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchAdminUserDetailById,
    fetchAdminUsersList,
    updateAdminUser,
} from '../api/client';
import { AdminUsersFilters, AdminUserUpdatePayload } from '../api/types';

export const useAdminUsersList = (filters?: AdminUsersFilters) => {
    return useQuery({
        queryKey: ['admin-users', filters],
        queryFn: () => fetchAdminUsersList(filters),
    });
};

export const useAdminUserDetail = (userId: string) => {
    return useQuery({
        queryKey: ['admin-user-detail', userId],
        queryFn: () => fetchAdminUserDetailById(userId),
        enabled: !!userId,
    });
};

export const useUpdateAdminUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, payload }: { userId: string; payload: AdminUserUpdatePayload }) =>
            updateAdminUser(userId, payload),
        onSuccess: (data, variables) => {
            // Invalidar lista de usuarios y detalle del usuario actualizado
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-user-detail', variables.userId] });
        },
    });
};

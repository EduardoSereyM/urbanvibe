// src/hooks/useUserRoles.ts
import { useQuery } from '@tanstack/react-query';
import { client } from '../api/client';

interface UserRolesResponse {
    roles: string[];
    is_super_admin: boolean;
    has_b2b_access: boolean;
}

async function fetchUserRoles(): Promise<UserRolesResponse> {
    try {
        // Intentar obtener roles B2B
        const response = await client.get('/venues-admin/me/venues');

        // Si llegamos aquí, el usuario tiene acceso B2B
        // Ahora necesitamos saber si es SUPER_ADMIN específicamente
        // Por ahora, asumimos que si tiene acceso, revisamos los roles en la respuesta

        return {
            roles: [], // El backend debería devolver esto
            is_super_admin: false, // Detectar si tiene rol SUPER_ADMIN
            has_b2b_access: true,
        };
    } catch (error: any) {
        // Si falla con 403/401, es usuario B2C
        if (error.response?.status === 403 || error.response?.status === 401) {
            return {
                roles: ['APP_USER'],
                is_super_admin: false,
                has_b2b_access: false,
            };
        }

        // Error desconocido, asumir B2C
        return {
            roles: ['APP_USER'],
            is_super_admin: false,
            has_b2b_access: false,
        };
    }
}

export function useUserRoles() {
    return useQuery<UserRolesResponse>({
        queryKey: ['user', 'roles'],
        queryFn: fetchUserRoles,
        staleTime: 300_000, // 5 minutos
    });
}

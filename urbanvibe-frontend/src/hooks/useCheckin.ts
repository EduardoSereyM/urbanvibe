import { useMutation } from '@tanstack/react-query';
import { client } from '../api/client';
import { Alert } from 'react-native';

interface CheckinPayload {
    token_id: string;
    user_lat?: number;
    user_lng?: number;
}

interface CheckinResponse {
    id: string;
    status: string;
    geofence_passed: boolean;
    points_awarded?: number;
    venue_id: string;
}

export function useCheckin() {
    return useMutation({
        mutationFn: async (payload: CheckinPayload) => {
            const { data } = await client.post<CheckinResponse>('/checkins/scan', payload);
            return data;
        },
        onError: (error: any) => {
            console.error('Check-in error:', error);
            const message = error.response?.data?.detail || 'No se pudo procesar el check-in.';
            Alert.alert('Error', message);
        },
        onSuccess: (data) => {
            if (data.status === 'confirmed') {
                Alert.alert('¡Check-in Exitoso!', 'Has registrado tu visita correctamente.');
            } else {
                Alert.alert('Check-in Pendiente', 'Tu visita ha sido registrada y está pendiente de validación.');
            }
        }
    });
}

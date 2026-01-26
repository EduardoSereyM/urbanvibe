
import { client } from './client';

export interface Level {
    id: string;
    name: string;
    min_points: number;
    benefits: string[];
}

export interface Badge {
    id: string;
    name: string;
    description?: string;
    icon_url?: string;
    category: string;
}

export interface Challenge {
    id: string;
    code: string;
    title: string;
    description?: string;
    challenge_type: string;
    target_value: number;
    is_active: boolean;
    reward_points: number;
    reward_badge_id?: string;
    reward_promotion_id?: string;
}

export interface GamificationEvent {
    event_code: string;
    target_type: string;
    description?: string;
    points: number;
    is_active: boolean;
}

export const AdminGamificationService = {
    // Levels
    getLevels: async (): Promise<Level[]> => {
        const response = await client.get('/admin/gamification/levels');
        return response.data;
    },

    createLevel: async (data: Omit<Level, 'id'>): Promise<Level> => {
        const response = await client.post('/admin/gamification/levels', data);
        return response.data;
    },

    updateLevel: async (id: string, data: Partial<Level>): Promise<Level> => {
        const response = await client.patch(`/admin/gamification/levels/${id}`, data);
        return response.data;
    },

    deleteLevel: async (id: string): Promise<void> => {
        await client.delete(`/admin/gamification/levels/${id}`);
    },

    // Badges
    getBadges: async (): Promise<Badge[]> => {
        const response = await client.get('/admin/gamification/badges');
        return response.data;
    },

    createBadge: async (data: Omit<Badge, 'id'>): Promise<Badge> => {
        const response = await client.post('/admin/gamification/badges', data);
        return response.data;
    },

    updateBadge: async (id: string, data: Partial<Badge>): Promise<Badge> => {
        const response = await client.patch(`/admin/gamification/badges/${id}`, data);
        return response.data;
    },

    deleteBadge: async (id: string): Promise<void> => {
        await client.delete(`/admin/gamification/badges/${id}`);
    },

    // Challenges
    getChallenges: async (): Promise<Challenge[]> => {
        const response = await client.get('/admin/gamification/challenges');
        return response.data;
    },

    createChallenge: async (data: any): Promise<Challenge> => {
        const response = await client.post('/admin/gamification/challenges', data);
        return response.data;
    },

    updateChallenge: async (id: string, data: Partial<Challenge>): Promise<Challenge> => {
        const response = await client.patch(`/admin/gamification/challenges/${id}`, data);
        return response.data;
    },

    deleteChallenge: async (id: string): Promise<void> => {
        await client.delete(`/admin/gamification/challenges/${id}`);
    },

    // Events (Point Rules)
    getEvents: async (): Promise<GamificationEvent[]> => {
        const response = await client.get('/admin/gamification/events');
        return response.data;
    },

    updateEvent: async (eventCode: string, data: Partial<GamificationEvent>): Promise<GamificationEvent> => {
        const response = await client.patch(`/admin/gamification/events/${eventCode}`, data);
        return response.data;
    }
};


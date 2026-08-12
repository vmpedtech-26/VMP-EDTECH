import { api } from '../api-client';

export interface MetricsOverview {
    totals: {
        users: number;
        companies: number;
        courses: number;
        enrollments: number;
        credentials: number;
        quotes: number;
    };
    quotes: {
        pending: number;
        contacted: number;
        converted: number;
        rejected: number;
        conversion_rate: number;
    };
    enrollments: {
        active: number;
        completed: number;
        completion_rate: number;
    };
}

export interface RecentActivityItem {
    id: string;
    alumnoNombre: string;
    cursoNombre: string;
    createdAt: string;
}

export const metricsApi = {
    async overview(): Promise<MetricsOverview> {
        return api.get('/metrics/overview');
    },

    async recentActivity(limit: number = 5): Promise<{ items: RecentActivityItem[] }> {
        return api.get(`/metrics/recent-activity?limit=${limit}`);
    },
};

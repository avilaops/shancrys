import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Plan {
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    currency: string;
    features: PlanFeatures;
    sortOrder: number;
}

export interface PlanFeatures {
    maxProjects: number;
    maxUsers: number;
    maxStorageGB: number;
    maxModelsPerProject: number;
    hasAdvancedAnalytics: boolean;
    has4DSimulation: boolean;
    hasOfflineSync: boolean;
    hasAPIAccess: boolean;
    hasPrioritySupport: boolean;
    hasCustomBranding: boolean;
    hasSSOIntegration: boolean;
}

export interface Subscription {
    id: string;
    tenantId: string;
    planId: string;
    status: string;
    billingInterval: 'Monthly' | 'Yearly';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    plan?: Plan;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    total: number;
    currency: string;
    status: string;
    paidAt?: string;
    dueDate: string;
    hostedInvoiceUrl?: string;
    invoicePdfUrl?: string;
}

export interface UsageStats {
    projectCount: number;
    userCount: number;
    storageUsedGB: number;
    modelCount: number;
    limits: PlanFeatures;
}

export const billingApi = {
    // Plans
    getPlans: async (): Promise<Plan[]> => {
        const response = await api.get('/billing/plans');
        return response.data;
    },

    getPlan: async (planId: string): Promise<Plan> => {
        const response = await api.get(`/billing/plans/${planId}`);
        return response.data;
    },

    // Subscription
    getSubscription: async (): Promise<Subscription> => {
        const response = await api.get('/billing/subscription');
        return response.data;
    },

    createSubscription: async (planId: string, interval: 'Monthly' | 'Yearly', trialDays?: string): Promise<Subscription> => {
        const response = await api.post('/billing/subscription', {
            planId,
            interval,
            trialDays,
        });
        return response.data;
    },

    cancelSubscription: async (immediately = false): Promise<Subscription> => {
        const response = await api.post('/billing/subscription/cancel', { immediately });
        return response.data;
    },

    reactivateSubscription: async (): Promise<Subscription> => {
        const response = await api.post('/billing/subscription/reactivate');
        return response.data;
    },

    changePlan: async (newPlanId: string): Promise<Subscription> => {
        const response = await api.post('/billing/subscription/change-plan', { newPlanId });
        return response.data;
    },

    // Checkout
    createCheckout: async (
        planId: string,
        interval: 'Monthly' | 'Yearly',
        successUrl: string,
        cancelUrl: string
    ): Promise<{ sessionId: string; url: string }> => {
        const response = await api.post('/billing/checkout', {
            planId,
            interval,
            successUrl,
            cancelUrl,
        });
        return response.data;
    },

    // Portal
    createPortal: async (returnUrl: string): Promise<{ url: string }> => {
        const response = await api.post('/billing/portal', { returnUrl });
        return response.data;
    },

    // Invoices
    getInvoices: async (limit = 10): Promise<Invoice[]> => {
        const response = await api.get(`/billing/invoices?limit=${limit}`);
        return response.data;
    },

    // Usage
    getUsage: async (): Promise<UsageStats> => {
        const response = await api.get('/billing/usage');
        return response.data;
    },
};

export default api;

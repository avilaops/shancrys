/**
 * Store de autenticação com Zustand
 * Gerencia estado global de autenticação
 */
import { create } from 'zustand';
import { authService } from '../services/api';
import type { User, LoginCredentials, RegisterData } from '../types';

interface AuthState {
    // Estado
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Ações
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
    updateUser: (data: Partial<User>) => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    // Estado inicial
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // Login
    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const authData = await authService.login(credentials);
            set({
                user: authData.user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message || 'Erro ao fazer login',
                isLoading: false,
            });
            throw error;
        }
    },

    // Registro
    register: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const authData = await authService.register(data);
            set({
                user: authData.user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message || 'Erro ao registrar',
                isLoading: false,
            });
            throw error;
        }
    },

    // Logout
    logout: async () => {
        set({ isLoading: true });
        try {
            await authService.logout();
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        } catch (error: any) {
            console.error('Logout error:', error);
            // Limpa o estado mesmo com erro
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },

    // Carrega usuário do storage
    loadUser: async () => {
        set({ isLoading: true });
        try {
            const user = await authService.getCurrentUser();
            const isAuthenticated = await authService.isAuthenticated();

            set({
                user,
                isAuthenticated,
                isLoading: false,
            });
        } catch (error: any) {
            console.error('Load user error:', error);
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },

    // Atualiza perfil do usuário
    updateUser: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const updatedUser = await authService.updateProfile(data);
            set({
                user: updatedUser,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message || 'Erro ao atualizar perfil',
                isLoading: false,
            });
            throw error;
        }
    },

    // Limpa erro
    clearError: () => set({ error: null }),
}));

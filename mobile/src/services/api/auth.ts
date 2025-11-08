/**
 * Serviço de autenticação
 * Gerencia login, registro, logout e refresh token
 */
import apiClient from './client';
import secureStorage from '../storage/secure-storage';
import { AUTH_CONFIG } from '../../constants/config';
import type {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    User,
    ApiResponse
} from '../../types';

class AuthService {
    /**
     * Faz login do usuário
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await apiClient.post<ApiResponse<AuthResponse>>(
            '/auth/login',
            credentials
        );

        const authData = response.data.data;

        // Salva tokens e dados do usuário
        await this.saveAuthData(authData);

        return authData;
    }

    /**
     * Registra novo usuário
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await apiClient.post<ApiResponse<AuthResponse>>(
            '/auth/register',
            data
        );

        const authData = response.data.data;

        // Salva tokens e dados do usuário
        await this.saveAuthData(authData);

        return authData;
    }

    /**
     * Faz logout do usuário
     */
    async logout(): Promise<void> {
        try {
            // Chama endpoint de logout (se existir)
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Limpa dados locais independente do resultado
            await this.clearAuthData();
        }
    }

    /**
     * Atualiza o token usando refresh token
     */
    async refreshToken(): Promise<string> {
        const refreshToken = await secureStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await apiClient.post<ApiResponse<{ token: string }>>(
            '/auth/refresh',
            { refreshToken }
        );

        const newToken = response.data.data.token;
        await secureStorage.setItem(AUTH_CONFIG.TOKEN_KEY, newToken);

        return newToken;
    }

    /**
     * Recupera o usuário atual do storage
     */
    async getCurrentUser(): Promise<User | null> {
        const userJson = await secureStorage.getItem(AUTH_CONFIG.USER_KEY);

        if (!userJson) {
            return null;
        }

        try {
            return JSON.parse(userJson);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Verifica se o usuário está autenticado
     */
    async isAuthenticated(): Promise<boolean> {
        const token = await secureStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        return !!token;
    }

    /**
     * Recupera o token atual
     */
    async getToken(): Promise<string | null> {
        return await secureStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    }

    /**
     * Atualiza dados do perfil do usuário
     */
    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await apiClient.put<ApiResponse<User>>(
            '/auth/profile',
            data
        );

        const updatedUser = response.data.data;

        // Atualiza usuário no storage
        await secureStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(updatedUser));

        return updatedUser;
    }

    /**
     * Solicita recuperação de senha
     */
    async requestPasswordReset(email: string): Promise<void> {
        await apiClient.post('/auth/forgot-password', { email });
    }

    /**
     * Reseta a senha com token
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        await apiClient.post('/auth/reset-password', { token, newPassword });
    }

    /**
     * Salva dados de autenticação no storage
     */
    private async saveAuthData(authData: AuthResponse): Promise<void> {
        await Promise.all([
            secureStorage.setItem(AUTH_CONFIG.TOKEN_KEY, authData.token),
            secureStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, authData.refreshToken),
            secureStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(authData.user)),
        ]);
    }

    /**
     * Limpa dados de autenticação do storage
     */
    private async clearAuthData(): Promise<void> {
        await Promise.all([
            secureStorage.removeItem(AUTH_CONFIG.TOKEN_KEY),
            secureStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY),
            secureStorage.removeItem(AUTH_CONFIG.USER_KEY),
        ]);
    }
}

export default new AuthService();

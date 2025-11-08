/**
 * Cliente HTTP configurado com Axios
 * Gerencia interceptors, autenticação e tratamento de erros
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../../constants/config';
import secureStorage from '../storage/secure-storage';
import type { ApiError } from '../../types';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    /**
     * Configura interceptors para requests e responses
     */
    private setupInterceptors(): void {
        // Request Interceptor - adiciona token de autenticação
        this.client.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                const token = await secureStorage.getItem(AUTH_CONFIG.TOKEN_KEY);

                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                return config;
            },
            (error: AxiosError) => {
                return Promise.reject(error);
            }
        );

        // Response Interceptor - trata erros e refresh token
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

                // Se erro 401 e não é uma tentativa de retry
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        // Tenta fazer refresh do token
                        const refreshToken = await secureStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);

                        if (refreshToken) {
                            const response = await axios.post(
                                `${API_CONFIG.BASE_URL}/auth/refresh`,
                                { refreshToken }
                            );

                            const { token } = response.data;
                            await secureStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);

                            // Retry original request com novo token
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                            }
                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh falhou, fazer logout
                        await this.clearAuth();
                        // Você pode emitir um evento aqui para navegar para login
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(this.handleError(error));
            }
        );
    }

    /**
     * Trata erros da API
     */
    private handleError(error: AxiosError): ApiError {
        if (error.response) {
            // Erro da API
            return {
                message: (error.response.data as any)?.message || 'Erro no servidor',
                errors: (error.response.data as any)?.errors,
                statusCode: error.response.status,
            };
        } else if (error.request) {
            // Requisição foi feita mas sem resposta
            return {
                message: 'Sem resposta do servidor. Verifique sua conexão.',
                statusCode: 0,
            };
        } else {
            // Erro ao configurar requisição
            return {
                message: error.message || 'Erro desconhecido',
                statusCode: 0,
            };
        }
    }

    /**
     * Limpa dados de autenticação
     */
    private async clearAuth(): Promise<void> {
        await secureStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        await secureStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        await secureStorage.removeItem(AUTH_CONFIG.USER_KEY);
    }

    /**
     * Retorna a instância do Axios configurada
     */
    getInstance(): AxiosInstance {
        return this.client;
    }
}

export default new ApiClient().getInstance();

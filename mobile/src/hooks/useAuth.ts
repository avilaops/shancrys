/**
 * Hook customizado para autenticação
 * Abstrai a lógica de autenticação e fornece interface simples
 */
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
    const {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        loadUser,
        updateUser,
        clearError,
    } = useAuthStore();

    // Carrega usuário ao montar
    useEffect(() => {
        loadUser();
    }, []);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        updateUser,
        clearError,
    };
}

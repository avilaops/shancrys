/**
 * Serviço de armazenamento seguro para tokens e dados sensíveis
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class SecureStorageService {
    /**
     * Salva um item de forma segura
     */
    async setItem(key: string, value: string): Promise<void> {
        try {
            if (Platform.OS === 'web') {
                // No web, usa localStorage (menos seguro, mas funcional)
                localStorage.setItem(key, value);
            } else {
                // No mobile, usa SecureStore
                await SecureStore.setItemAsync(key, value);
            }
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            throw error;
        }
    }

    /**
     * Recupera um item
     */
    async getItem(key: string): Promise<string | null> {
        try {
            if (Platform.OS === 'web') {
                return localStorage.getItem(key);
            } else {
                return await SecureStore.getItemAsync(key);
            }
        } catch (error) {
            console.error(`Error getting ${key}:`, error);
            return null;
        }
    }

    /**
     * Remove um item
     */
    async removeItem(key: string): Promise<void> {
        try {
            if (Platform.OS === 'web') {
                localStorage.removeItem(key);
            } else {
                await SecureStore.deleteItemAsync(key);
            }
        } catch (error) {
            console.error(`Error removing ${key}:`, error);
            throw error;
        }
    }

    /**
     * Limpa todos os itens
     */
    async clear(): Promise<void> {
        try {
            if (Platform.OS === 'web') {
                localStorage.clear();
            } else {
                // Para SecureStore, precisamos remover item por item
                // Lista de keys conhecidas do app
                const keys = ['@shancrys:token', '@shancrys:refresh_token', '@shancrys:user'];
                await Promise.all(keys.map(key => this.removeItem(key)));
            }
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw error;
        }
    }
}

export default new SecureStorageService();

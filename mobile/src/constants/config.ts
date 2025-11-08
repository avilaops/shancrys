/**
 * Configurações globais do aplicativo Shancrys BIM
 */

// API Base URL - ajuste conforme seu ambiente
export const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api',
    TIMEOUT: 30000,
    AZURE_BLOB_URL: process.env.EXPO_PUBLIC_AZURE_BLOB_URL || '',
};

// Configurações de autenticação
export const AUTH_CONFIG = {
    TOKEN_KEY: '@shancrys:token',
    REFRESH_TOKEN_KEY: '@shancrys:refresh_token',
    USER_KEY: '@shancrys:user',
};

// Configurações de navegação
export const NAV_CONFIG = {
    ANIMATION_DURATION: 300,
};

// Configurações do BIM Viewer
export const BIM_CONFIG = {
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    SUPPORTED_FORMATS: ['.ifc', '.rvt', '.nwd', '.dwg'],
    CACHE_SIZE: 50 * 1024 * 1024, // 50MB
};

// Tema
export const THEME = {
    colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
        textSecondary: '#64748b',
        border: '#e2e8f0',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
    },
};

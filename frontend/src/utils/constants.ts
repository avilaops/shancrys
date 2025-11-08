/**
 * Application-wide constants
 */

// IFC Cache Configuration
export const CACHE_CONFIG = {
    DB_NAME: 'ShancrysIFCCache',
    DB_VERSION: 1,
    STORE_NAME: 'ifcFiles',
    MAX_SIZE_MB: parseInt(import.meta.env.VITE_IFC_CACHE_MAX_SIZE_MB || '500'),
    EXPIRY_DAYS: parseInt(import.meta.env.VITE_IFC_CACHE_EXPIRY_DAYS || '30'),
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
    MAX_FILE_SIZE_MB: 100,
    ACCEPTED_FORMATS: ['.ifc'],
    MAX_FILES_PER_PROJECT: 50,
} as const;

// 3D Viewer Configuration
export const VIEWER_CONFIG = {
    DEFAULT_CAMERA_POSITION: { x: 10, y: 10, z: 10 },
    DEFAULT_CAMERA_FOV: 75,
    NEAR_PLANE: 0.1,
    FAR_PLANE: 10000,
    GRID_SIZE: 100,
    GRID_DIVISIONS: 50,
    BACKGROUND_COLOR: 0xf0f0f0,
    AMBIENT_LIGHT_INTENSITY: 0.5,
    DIRECTIONAL_LIGHT_INTENSITY: 0.8,
} as const;

// 4D Timeline Configuration
export const TIMELINE_CONFIG = {
    DEFAULT_PLAYBACK_SPEED: 1,
    MIN_PLAYBACK_SPEED: 0.1,
    MAX_PLAYBACK_SPEED: 10,
    PLAYBACK_SPEEDS: [0.5, 1, 2, 5, 10],
    DEFAULT_TIME_UNIT: 'days',
    ANIMATION_FPS: 60,
} as const;

// Element Colors by IFC Type
export const IFC_COLORS = {
    IFCWALL: 0xcccccc,
    IFCWALLSTANDARDCASE: 0xcccccc,
    IFCSLAB: 0x999999,
    IFCROOF: 0x8b4513,
    IFCCOLUMN: 0x808080,
    IFCBEAM: 0x8b7355,
    IFCWINDOW: 0x87ceeb,
    IFCDOOR: 0x8b4513,
    IFCSTAIR: 0xa9a9a9,
    IFCRAILING: 0x696969,
    IFCFURNISHINGELEMENT: 0xdeb887,
    IFCBUILDINGELEMENTPROXY: 0xdda0dd,
    IFCSPACE: 0xf0f8ff,
    IFCMEMBER: 0x708090,
    IFCPLATE: 0x778899,
    IFCCOVERING: 0xd3d3d3,
    IFCFOOTING: 0x654321,
    IFCPILE: 0x8b4726,
    DEFAULT: 0xaaaaaa,
} as const;

// Measurement Units
export const UNITS = {
    LENGTH: {
        MILLIMETER: { label: 'mm', factor: 1 },
        CENTIMETER: { label: 'cm', factor: 10 },
        METER: { label: 'm', factor: 1000 },
        KILOMETER: { label: 'km', factor: 1000000 },
        INCH: { label: 'in', factor: 25.4 },
        FOOT: { label: 'ft', factor: 304.8 },
    },
    AREA: {
        SQUARE_METER: { label: 'm²', factor: 1 },
        SQUARE_FOOT: { label: 'ft²', factor: 0.092903 },
    },
    VOLUME: {
        CUBIC_METER: { label: 'm³', factor: 1 },
        CUBIC_FOOT: { label: 'ft³', factor: 0.0283168 },
        LITER: { label: 'L', factor: 0.001 },
    },
} as const;

// Activity Status Colors
export const ACTIVITY_STATUS_COLORS = {
    'not-started': '#9CA3AF',
    'in-progress': '#3B82F6',
    'completed': '#10B981',
    'delayed': '#EF4444',
} as const;

// Priority Colors
export const PRIORITY_COLORS = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#F97316',
    critical: '#EF4444',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
    },
    PROJECTS: {
        LIST: '/projects',
        CREATE: '/projects',
        GET: (id: string) => `/projects/${id}`,
        UPDATE: (id: string) => `/projects/${id}`,
        DELETE: (id: string) => `/projects/${id}`,
    },
    MODELS: {
        LIST: (projectId: string) => `/projects/${projectId}/models`,
        UPLOAD: (projectId: string) => `/projects/${projectId}/models`,
        GET: (projectId: string, modelId: string) => `/projects/${projectId}/models/${modelId}`,
        DELETE: (projectId: string, modelId: string) => `/projects/${projectId}/models/${modelId}`,
    },
    BILLING: {
        PLANS: '/billing/plans',
        SUBSCRIPTION: '/billing/subscription',
        INVOICES: '/billing/invoices',
        USAGE: '/billing/usage',
    },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
    VIEWER_SETTINGS: 'viewer_settings',
    RECENT_PROJECTS: 'recent_projects',
} as const;

// Feature Flags
export const FEATURES = {
    ENABLE_4D_SIMULATION: import.meta.env.VITE_ENABLE_4D_SIMULATION === 'true',
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    ENABLE_OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
} as const;

// Keyboard Shortcuts
export const SHORTCUTS = {
    VIEWER: {
        FOCUS_SELECTION: 'f',
        HIDE_SELECTION: 'h',
        ISOLATE_SELECTION: 'i',
        RESET_VIEW: 'r',
        TOP_VIEW: '1',
        FRONT_VIEW: '2',
        RIGHT_VIEW: '3',
        PERSPECTIVE_VIEW: '4',
        TOGGLE_GRID: 'g',
        TOGGLE_AXES: 'a',
        WIREFRAME: 'w',
    },
    TIMELINE: {
        PLAY_PAUSE: 'space',
        STEP_FORWARD: 'right',
        STEP_BACKWARD: 'left',
        JUMP_TO_START: 'home',
        JUMP_TO_END: 'end',
    },
    GENERAL: {
        SAVE: 'ctrl+s',
        UNDO: 'ctrl+z',
        REDO: 'ctrl+y',
        SEARCH: 'ctrl+f',
        SELECT_ALL: 'ctrl+a',
    },
} as const;

// Date Formats
export const DATE_FORMATS = {
    SHORT: 'DD/MM/YYYY',
    LONG: 'DD de MMMM de YYYY',
    WITH_TIME: 'DD/MM/YYYY HH:mm',
    TIME_ONLY: 'HH:mm',
    ISO: 'YYYY-MM-DD',
} as const;

// Validation Rules
export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PROJECT_NAME_MIN_LENGTH: 3,
    PROJECT_NAME_MAX_LENGTH: 100,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
    UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
    FILE_TOO_LARGE: 'Arquivo muito grande. Tamanho máximo: {maxSize}MB',
    INVALID_FILE_FORMAT: 'Formato de arquivo inválido. Formatos aceitos: {formats}',
    GENERIC_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
    CACHE_FULL: 'Cache cheio. Limpe arquivos antigos.',
    PARSING_ERROR: 'Erro ao processar arquivo IFC.',
} as const;

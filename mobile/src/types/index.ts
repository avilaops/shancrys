/**
 * Tipos TypeScript para o aplicativo Shancrys BIM
 */

// Auth Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'Admin' | 'ProjectManager' | 'Engineer' | 'Contractor' | 'Client';
    avatar?: string;
    company?: string;
    phone?: string;
    createdAt: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    role: string;
    company?: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    user: User;
    expiresIn: number;
}

// Project Types
export interface Project {
    id: string;
    name: string;
    description: string;
    address: string;
    status: 'Planning' | 'InProgress' | 'OnHold' | 'Completed';
    startDate: string;
    endDate?: string;
    budget?: number;
    client: string;
    managers: string[];
    thumbnail?: string;
    progress: number;
    location?: {
        latitude: number;
        longitude: number;
    };
    createdAt: string;
    updatedAt: string;
}

// BIM Model Types
export interface BIMModel {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    fileUrl: string;
    fileSize: number;
    format: 'IFC' | 'RVT' | 'NWD' | 'DWG';
    version: string;
    uploadedBy: string;
    uploadedAt: string;
    thumbnail?: string;
    metadata?: Record<string, any>;
}

// Material Types
export interface Material {
    id: string;
    name: string;
    category: string;
    unit: string;
    costPerUnit: number;
    supplier?: string;
    description?: string;
    specifications?: Record<string, any>;
    image?: string;
    stock?: number;
}

// Schedule Types
export interface ScheduleTask {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    duration: number;
    progress: number;
    status: 'NotStarted' | 'InProgress' | 'Completed' | 'Delayed';
    assignedTo: string[];
    dependencies: string[];
    cost?: number;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    statusCode: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

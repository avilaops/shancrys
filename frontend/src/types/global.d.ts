/**
 * Global Type Definitions for Shancrys Platform
 */

import * as THREE from 'three';

declare global {
    // Environment variables
    interface ImportMetaEnv {
        readonly VITE_API_URL: string;
        readonly VITE_STRIPE_PUBLIC_KEY: string;
        readonly VITE_ENABLE_4D_SIMULATION: string;
        readonly VITE_ENABLE_ANALYTICS: string;
        readonly VITE_ENABLE_OFFLINE_MODE: string;
        readonly VITE_IFC_CACHE_MAX_SIZE_MB: string;
        readonly VITE_IFC_CACHE_EXPIRY_DAYS: string;
        readonly VITE_ENV: string;
    }

    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }
}

// BIM/IFC Types
export interface IFCGeometry {
    vertices: Float32Array;
    indices: Uint32Array;
    normals?: Float32Array;
    uvs?: Float32Array;
}

export interface IFCProperties {
    [key: string]: string | number | boolean | null;
}

export interface IFCElement {
    expressID: number;
    type: string;
    ifcType: number;
    guid: string;
    name: string;
    description: string;
    properties: IFCProperties;
    geometry?: IFCGeometry;
    materialId?: number;
    typeId?: number;
    parentId?: number;
}

export interface IFCSpatialNode {
    expressID: number;
    type: string;
    name: string;
    description?: string;
    children: IFCSpatialNode[];
    elements: number[]; // Express IDs
    parentId?: number;
}

export interface IFCProject {
    name: string;
    description: string;
    elements: IFCElement[];
    spatialStructure: IFCSpatialNode[];
    materials: Map<number, string>;
    types: Map<number, string>;
}

// 3D Viewer Types
export interface ViewerCamera {
    position: THREE.Vector3;
    target: THREE.Vector3;
    zoom: number;
}

export interface ViewerState {
    selectedElements: number[];
    highlightedElements: number[];
    hiddenElements: number[];
    isolatedElements: number[];
    transparentElements: number[];
    colorOverrides: Map<number, string>;
}

export interface ViewerControls {
    rotateSpeed: number;
    zoomSpeed: number;
    panSpeed: number;
    autoRotate: boolean;
    enableDamping: boolean;
}

// 4D Timeline Types
export interface Activity {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    progress: number;
    elementIds: number[];
    predecessors: string[];
    color?: string;
    status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
}

export interface TimelineState {
    currentDate: Date;
    startDate: Date;
    endDate: Date;
    isPlaying: boolean;
    playbackSpeed: number;
    activities: Activity[];
}

// Measurement Types
export type MeasurementType = 'distance' | 'area' | 'volume' | 'angle';

export interface Measurement {
    id: string;
    type: MeasurementType;
    points: THREE.Vector3[];
    value: number;
    unit: string;
    label?: string;
    color?: string;
}

// Annotation Types
export interface Annotation {
    id: string;
    elementId?: number;
    position: THREE.Vector3;
    title: string;
    description: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    attachments?: string[];
}

// Section Plane Types
export interface SectionPlane {
    id: string;
    name: string;
    normal: THREE.Vector3;
    constant: number;
    enabled: boolean;
    color?: string;
}

// Quantity Takeoff Types
export interface QuantityItem {
    elementId: number;
    elementType: string;
    quantity: number;
    unit: string;
    properties: {
        length?: number;
        width?: number;
        height?: number;
        area?: number;
        volume?: number;
        [key: string]: number | string | undefined;
    };
}

// Material Catalog Types
export interface Material {
    id: string;
    name: string;
    category: string;
    manufacturer?: string;
    properties: {
        density?: number;
        cost?: number;
        carbonFootprint?: number;
        [key: string]: number | string | boolean | undefined;
    };
    image?: string;
    datasheet?: string;
}

// Project Types
export interface Project {
    id: string;
    name: string;
    description: string;
    location?: string;
    startDate?: Date;
    endDate?: Date;
    status: 'planning' | 'design' | 'construction' | 'completed';
    owner: string;
    createdAt: Date;
    updatedAt: Date;
    models: ProjectModel[];
    team: TeamMember[];
}

export interface ProjectModel {
    id: string;
    projectId: string;
    name: string;
    fileName: string;
    fileSize: number;
    uploadedAt: Date;
    uploadedBy: string;
    version: number;
    status: 'processing' | 'ready' | 'error';
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    joinedAt: Date;
    avatar?: string;
}

// Cache Types
export interface CacheStats {
    count: number;
    totalSizeMB: number;
    files: Array<{
        name: string;
        sizeMB: number;
        cachedAt: Date;
    }>;
}

export { };

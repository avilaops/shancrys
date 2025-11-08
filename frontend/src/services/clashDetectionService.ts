/**
 * Clash Detection Service - Advanced 3D Collision Detection for BIM
 * Detects geometric conflicts between building elements
 */

import * as THREE from 'three';
import type { IFCElement } from '@/types/global';

export type ClashType = 'hard' | 'soft' | 'clearance';
export type ClashSeverity = 'critical' | 'major' | 'minor' | 'warning';

export interface Clash {
    id: string;
    type: ClashType;
    severity: ClashSeverity;
    element1: {
        id: number;
        name: string;
        type: string;
    };
    element2: {
        id: number;
        name: string;
        type: string;
    };
    penetrationDepth: number;
    volume: number;
    center: THREE.Vector3;
    timestamp: Date;
    resolved: boolean;
    notes?: string;
}

export interface ClashDetectionOptions {
    tolerance: number; // mm
    checkHardClash: boolean;
    checkSoftClash: boolean;
    checkClearance: boolean;
    clearanceDistance: number; // mm
    excludePairs?: string[][]; // Pairs of types to exclude
    onProgress?: (progress: number, total: number) => void;
}

export interface ClashDetectionResult {
    clashes: Clash[];
    totalChecked: number;
    hardClashes: number;
    softClashes: number;
    clearanceViolations: number;
    processingTime: number;
}

const DEFAULT_OPTIONS: ClashDetectionOptions = {
    tolerance: 1, // 1mm
    checkHardClash: true,
    checkSoftClash: true,
    checkClearance: false,
    clearanceDistance: 50, // 50mm
};

/**
 * Run clash detection on IFC elements
 */
export async function detectClashes(
    elements: IFCElement[],
    options: Partial<ClashDetectionOptions> = {}
): Promise<ClashDetectionResult> {
    const startTime = performance.now();
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const clashes: Clash[] = [];
    let totalChecked = 0;

    // Build spatial index (BVH) for fast collision queries
    const elementBounds = buildBoundingBoxIndex(elements);

    // Check all pairs
    for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
            const el1 = elements[i];
            const el2 = elements[j];

            // Skip if excluded pair
            if (opts.excludePairs && isExcludedPair(el1.type, el2.type, opts.excludePairs)) {
                continue;
            }

            totalChecked++;

            // Report progress
            if (opts.onProgress && totalChecked % 100 === 0) {
                opts.onProgress(totalChecked, (elements.length * (elements.length - 1)) / 2);
            }

            // Quick AABB test
            const box1 = elementBounds.get(el1.expressID);
            const box2 = elementBounds.get(el2.expressID);

            if (!box1 || !box2 || !box1.intersectsBox(box2)) {
                continue;
            }

            // Detailed collision detection
            const clash = await detectElementClash(el1, el2, box1, box2, opts);
            if (clash) {
                clashes.push(clash);
            }
        }
    }

    const processingTime = performance.now() - startTime;

    // Count by type
    const hardClashes = clashes.filter(c => c.type === 'hard').length;
    const softClashes = clashes.filter(c => c.type === 'soft').length;
    const clearanceViolations = clashes.filter(c => c.type === 'clearance').length;

    return {
        clashes,
        totalChecked,
        hardClashes,
        softClashes,
        clearanceViolations,
        processingTime,
    };
}

/**
 * Build bounding box index for all elements
 */
function buildBoundingBoxIndex(elements: IFCElement[]): Map<number, THREE.Box3> {
    const index = new Map<number, THREE.Box3>();

    elements.forEach(element => {
        if (!element.geometry) return;

        const box = new THREE.Box3();
        const positions = element.geometry.vertices;

        for (let i = 0; i < positions.length; i += 3) {
            box.expandByPoint(new THREE.Vector3(
                positions[i],
                positions[i + 1],
                positions[i + 2]
            ));
        }

        index.set(element.expressID, box);
    });

    return index;
}

/**
 * Check if pair should be excluded
 */
function isExcludedPair(type1: string, type2: string, excludePairs: string[][]): boolean {
    return excludePairs.some(pair =>
        (pair[0] === type1 && pair[1] === type2) ||
        (pair[0] === type2 && pair[1] === type1)
    );
}

/**
 * Detect clash between two elements
 */
async function detectElementClash(
    el1: IFCElement,
    el2: IFCElement,
    box1: THREE.Box3,
    box2: THREE.Box3,
    options: ClashDetectionOptions
): Promise<Clash | null> {
    if (!el1.geometry || !el2.geometry) return null;

    // Create meshes for detailed intersection test
    const geometry1 = createBufferGeometry(el1.geometry);
    const geometry2 = createBufferGeometry(el2.geometry);

    const mesh1 = new THREE.Mesh(geometry1);
    const mesh2 = new THREE.Mesh(geometry2);

    // Calculate intersection
    const intersection = calculateIntersectionVolume(mesh1, mesh2);

    if (!intersection || intersection.volume < options.tolerance / 1000) {
        return null;
    }

    // Determine clash type and severity
    const type = determineClashType(el1, el2, intersection, options);
    const severity = determineClashSeverity(el1, el2, intersection);

    // Calculate center of intersection
    const center = new THREE.Vector3();
    box1.getCenter(center).add(new THREE.Vector3().copy(box2.getCenter(center))).multiplyScalar(0.5);

    return {
        id: `clash_${el1.expressID}_${el2.expressID}_${Date.now()}`,
        type,
        severity,
        element1: {
            id: el1.expressID,
            name: el1.name,
            type: el1.type,
        },
        element2: {
            id: el2.expressID,
            name: el2.name,
            type: el2.type,
        },
        penetrationDepth: intersection.depth,
        volume: intersection.volume,
        center,
        timestamp: new Date(),
        resolved: false,
    };
}

/**
 * Create Three.js BufferGeometry from IFC geometry
 */
function createBufferGeometry(geometry: {
    vertices: Float32Array;
    indices: Uint32Array;
    normals?: Float32Array;
}): THREE.BufferGeometry {
    const bufferGeometry = new THREE.BufferGeometry();

    bufferGeometry.setAttribute('position',
        new THREE.BufferAttribute(geometry.vertices, 3)
    );

    bufferGeometry.setIndex(
        new THREE.BufferAttribute(geometry.indices, 1)
    );

    if (geometry.normals) {
        bufferGeometry.setAttribute('normal',
            new THREE.BufferAttribute(geometry.normals, 3)
        );
    } else {
        bufferGeometry.computeVertexNormals();
    }

    return bufferGeometry;
}

/**
 * Calculate intersection volume between two meshes (simplified)
 */
function calculateIntersectionVolume(
    mesh1: THREE.Mesh,
    mesh2: THREE.Mesh
): { volume: number; depth: number } | null {
    // This is a simplified version
    // In production, you'd use a proper CSG library like three-bvh-csg

    const box1 = new THREE.Box3().setFromObject(mesh1);
    const box2 = new THREE.Box3().setFromObject(mesh2);

    const intersection = box1.clone().intersect(box2);

    if (intersection.isEmpty()) {
        return null;
    }

    const size = new THREE.Vector3();
    intersection.getSize(size);

    const volume = size.x * size.y * size.z;
    const depth = Math.min(size.x, size.y, size.z);

    return { volume, depth };
}

/**
 * Determine clash type based on element types and intersection
 */
function determineClashType(
    el1: IFCElement,
    el2: IFCElement,
    intersection: { volume: number; depth: number },
    options: ClashDetectionOptions
): ClashType {
    // Hard clash: structural elements intersecting
    const structuralTypes = ['IFCWALL', 'IFCCOLUMN', 'IFCBEAM', 'IFCSLAB', 'IFCFOOTING'];

    if (structuralTypes.includes(el1.type) && structuralTypes.includes(el2.type)) {
        if (intersection.depth > options.tolerance) {
            return 'hard';
        }
    }

    // MEP vs Structure
    const mepTypes = ['IFCPIPELEMENT', 'IFCDUCTFITTING', 'IFCCABLECARRIERFITTING'];
    if ((structuralTypes.includes(el1.type) && mepTypes.includes(el2.type)) ||
        (mepTypes.includes(el1.type) && structuralTypes.includes(el2.type))) {
        return 'hard';
    }

    // Soft clash: other intersections
    if (intersection.depth < options.clearanceDistance) {
        return 'soft';
    }

    return 'clearance';
}

/**
 * Determine clash severity
 */
function determineClashSeverity(
    _el1: IFCElement,
    _el2: IFCElement,
    intersection: { volume: number; depth: number }
): ClashSeverity {
    // Critical: large penetration or critical elements
    if (intersection.volume > 1.0 || intersection.depth > 100) {
        return 'critical';
    }

    // Major: significant penetration
    if (intersection.volume > 0.1 || intersection.depth > 50) {
        return 'major';
    }

    // Minor: small penetration
    if (intersection.volume > 0.01 || intersection.depth > 10) {
        return 'minor';
    }

    return 'warning';
}

/**
 * Group clashes by type or location
 */
export function groupClashesByType(clashes: Clash[]): Map<string, Clash[]> {
    const groups = new Map<string, Clash[]>();

    clashes.forEach(clash => {
        const key = `${clash.element1.type}_${clash.element2.type}`;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(clash);
    });

    return groups;
}

/**
 * Group clashes by severity
 */
export function groupClashesBySeverity(clashes: Clash[]): Map<ClashSeverity, Clash[]> {
    const groups = new Map<ClashSeverity, Clash[]>();

    clashes.forEach(clash => {
        if (!groups.has(clash.severity)) {
            groups.set(clash.severity, []);
        }
        groups.get(clash.severity)!.push(clash);
    });

    return groups;
}

/**
 * Export clashes to CSV
 */
export function exportClashesToCSV(clashes: Clash[]): string {
    const headers = [
        'ID',
        'Tipo',
        'Severidade',
        'Elemento 1 ID',
        'Elemento 1',
        'Elemento 2 ID',
        'Elemento 2',
        'Profundidade (mm)',
        'Volume (m³)',
        'Centro X',
        'Centro Y',
        'Centro Z',
        'Data',
        'Resolvido',
        'Notas'
    ];

    const rows = clashes.map(clash => [
        clash.id,
        clash.type,
        clash.severity,
        clash.element1.id,
        clash.element1.name,
        clash.element2.id,
        clash.element2.name,
        (clash.penetrationDepth * 1000).toFixed(2),
        clash.volume.toFixed(6),
        clash.center.x.toFixed(3),
        clash.center.y.toFixed(3),
        clash.center.z.toFixed(3),
        clash.timestamp.toISOString(),
        clash.resolved ? 'Sim' : 'Não',
        clash.notes || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Download clash report
 */
export function downloadClashReport(clashes: Clash[], filename: string = 'clash-report.csv'): void {
    const csv = exportClashesToCSV(clashes);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

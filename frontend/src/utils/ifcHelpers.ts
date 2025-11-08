/**
 * Utility functions for IFC element handling
 */

import * as THREE from 'three';
import { IFC_COLORS } from './constants';
import type { IFCElement } from '../services/ifcParser';

/**
 * Get color for IFC element type
 */
export function getIFCColor(type: string): number {
    const upperType = type.toUpperCase();
    return IFC_COLORS[upperType as keyof typeof IFC_COLORS] || IFC_COLORS.DEFAULT;
}

/**
 * Create Three.js material for IFC element
 */
export function createIFCMaterial(
    type: string,
    options?: {
        transparent?: boolean;
        opacity?: number;
        wireframe?: boolean;
    }
): THREE.MeshStandardMaterial {
    const color = getIFCColor(type);

    return new THREE.MeshStandardMaterial({
        color,
        transparent: options?.transparent ?? false,
        opacity: options?.opacity ?? 1,
        wireframe: options?.wireframe ?? false,
        side: THREE.DoubleSide,
        metalness: 0.1,
        roughness: 0.8,
    });
}

/**
 * Create Three.js BufferGeometry from IFC geometry data
 */
export function createBufferGeometry(
    vertices: Float32Array,
    indices: Uint32Array,
    normals?: Float32Array
): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    if (normals && normals.length > 0) {
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    } else {
        geometry.computeVertexNormals();
    }

    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
}

/**
 * Create Three.js Mesh from IFC element
 */
export function createMeshFromIFCElement(
    element: IFCElement,
    options?: {
        transparent?: boolean;
        opacity?: number;
        wireframe?: boolean;
    }
): THREE.Mesh | null {
    if (!element.geometry) return null;

    const geometry = createBufferGeometry(
        element.geometry.vertices,
        element.geometry.indices,
        element.geometry.normals
    );

    const material = createIFCMaterial(element.type, options);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = {
        expressID: element.expressID,
        type: element.type,
        ifcType: element.ifcType,
        guid: element.guid,
        name: element.name,
        properties: element.properties,
    };

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
}

/**
 * Get bounding box center of IFC element
 */
export function getElementCenter(element: IFCElement): THREE.Vector3 | null {
    if (!element.geometry) return null;

    const geometry = createBufferGeometry(
        element.geometry.vertices,
        element.geometry.indices
    );

    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox?.getCenter(center);
    geometry.dispose();

    return center;
}

/**
 * Calculate element volume (for slabs, walls, etc.)
 */
export function calculateElementVolume(element: IFCElement): number {
    if (!element.geometry) return 0;

    const geometry = createBufferGeometry(
        element.geometry.vertices,
        element.geometry.indices
    );

    // Use Three.js ConvexGeometry or calculate from mesh
    // For now, approximate using bounding box
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    geometry.dispose();

    if (!box) return 0;

    const size = new THREE.Vector3();
    box.getSize(size);

    return size.x * size.y * size.z;
}

/**
 * Calculate element surface area
 */
export function calculateElementArea(element: IFCElement): number {
    if (!element.geometry) return 0;

    const { vertices, indices } = element.geometry;
    let area = 0;

    // Calculate area of all triangles
    for (let i = 0; i < indices.length; i += 3) {
        const i1 = indices[i] * 3;
        const i2 = indices[i + 1] * 3;
        const i3 = indices[i + 2] * 3;

        const v1 = new THREE.Vector3(vertices[i1], vertices[i1 + 1], vertices[i1 + 2]);
        const v2 = new THREE.Vector3(vertices[i2], vertices[i2 + 1], vertices[i2 + 2]);
        const v3 = new THREE.Vector3(vertices[i3], vertices[i3 + 1], vertices[i3 + 2]);

        // Triangle area using cross product
        const a = new THREE.Vector3().subVectors(v2, v1);
        const b = new THREE.Vector3().subVectors(v3, v1);
        const cross = new THREE.Vector3().crossVectors(a, b);

        area += cross.length() / 2;
    }

    return area;
}

/**
 * Filter elements by type
 */
export function filterElementsByType(
    elements: IFCElement[],
    types: string[]
): IFCElement[] {
    const upperTypes = types.map(t => t.toUpperCase());
    return elements.filter(el => upperTypes.includes(el.type.toUpperCase()));
}

/**
 * Filter elements by property value
 */
export function filterElementsByProperty(
    elements: IFCElement[],
    propertyName: string,
    value: string | number | boolean
): IFCElement[] {
    return elements.filter(el => el.properties[propertyName] === value);
}

/**
 * Group elements by type
 */
export function groupElementsByType(
    elements: IFCElement[]
): Map<string, IFCElement[]> {
    const groups = new Map<string, IFCElement[]>();

    for (const element of elements) {
        const type = element.type.toUpperCase();
        if (!groups.has(type)) {
            groups.set(type, []);
        }
        groups.get(type)!.push(element);
    }

    return groups;
}

/**
 * Get element statistics
 */
export function getElementStatistics(elements: IFCElement[]): {
    total: number;
    byType: Map<string, number>;
    withGeometry: number;
    withoutGeometry: number;
} {
    const byType = new Map<string, number>();
    let withGeometry = 0;
    let withoutGeometry = 0;

    for (const element of elements) {
        const type = element.type.toUpperCase();
        byType.set(type, (byType.get(type) || 0) + 1);

        if (element.geometry) {
            withGeometry++;
        } else {
            withoutGeometry++;
        }
    }

    return {
        total: elements.length,
        byType,
        withGeometry,
        withoutGeometry,
    };
}

/**
 * Highlight element (change material)
 */
export function highlightMesh(
    mesh: THREE.Mesh,
    color: number = 0xffff00
): THREE.Material | THREE.Material[] {
    const originalMaterial = mesh.material;

    mesh.material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.8,
    });

    return originalMaterial;
}

/**
 * Restore original material
 */
export function restoreMesh(
    mesh: THREE.Mesh,
    originalMaterial: THREE.Material | THREE.Material[]
): void {
    if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
    }
    mesh.material = originalMaterial;
}

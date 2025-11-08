/**
 * Measurement calculation utilities for 3D BIM models
 */

import * as THREE from 'three';
import type { MeasurementType } from '@/types/global';
import { UNITS } from './constants';

/**
 * Calculate distance between two 3D points
 */
export function calculateDistance(
    point1: THREE.Vector3,
    point2: THREE.Vector3,
    unit: keyof typeof UNITS.LENGTH = 'METER'
): number {
    const distance = point1.distanceTo(point2);
    return distance / UNITS.LENGTH[unit].factor;
}

/**
 * Calculate area of a polygon defined by points
 */
export function calculatePolygonArea(
    points: THREE.Vector3[],
    unit: keyof typeof UNITS.AREA = 'SQUARE_METER'
): number {
    if (points.length < 3) return 0;

    // Use Newell's method for polygon area in 3D
    let area = 0;
    const n = points.length;

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const k = (i + 2) % n;

        const v1 = points[j].clone().sub(points[i]);
        const v2 = points[k].clone().sub(points[j]);

        const cross = new THREE.Vector3().crossVectors(v1, v2);
        area += cross.length() / 2;
    }

    return area / (UNITS.AREA[unit].factor ** 2);
}

/**
 * Calculate volume of a closed mesh using tetrahedron method
 */
export function calculateVolume(
    geometry: THREE.BufferGeometry,
    unit: keyof typeof UNITS.VOLUME = 'CUBIC_METER'
): number {
    const positions = geometry.attributes.position;
    const indices = geometry.index;

    if (!positions || !indices) return 0;

    let volume = 0;
    const vertices: THREE.Vector3[] = [];

    // Extract vertices
    for (let i = 0; i < positions.count; i++) {
        vertices.push(new THREE.Vector3(
            positions.getX(i),
            positions.getY(i),
            positions.getZ(i)
        ));
    }

    // Calculate volume using tetrahedron method
    for (let i = 0; i < indices.count; i += 3) {
        const a = vertices[indices.getX(i)];
        const b = vertices[indices.getY(i)];
        const c = vertices[indices.getZ(i)];

        // Volume of tetrahedron formed by triangle and origin
        const v321 = c.x * b.y * a.z;
        const v231 = b.x * c.y * a.z;
        const v312 = c.x * a.y * b.z;
        const v132 = a.x * c.y * b.z;
        const v213 = b.x * a.y * c.z;
        const v123 = a.x * b.y * c.z;

        volume += (1.0 / 6.0) * (-v321 + v231 + v312 - v132 - v213 + v123);
    }

    return Math.abs(volume) / (UNITS.VOLUME[unit].factor ** 3);
}

/**
 * Calculate angle between three points (vertex angle)
 */
export function calculateAngle(
    vertex: THREE.Vector3,
    point1: THREE.Vector3,
    point2: THREE.Vector3
): number {
    const vector1 = point1.clone().sub(vertex).normalize();
    const vector2 = point2.clone().sub(vertex).normalize();

    return Math.acos(vector1.dot(vector2)) * (180 / Math.PI); // Convert to degrees
}

/**
 * Find closest point on a line segment to a given point
 */
export function closestPointOnLineSegment(
    point: THREE.Vector3,
    lineStart: THREE.Vector3,
    lineEnd: THREE.Vector3
): THREE.Vector3 {
    const line = lineEnd.clone().sub(lineStart);
    const len = line.length();
    line.normalize();

    const v = point.clone().sub(lineStart);
    const d = v.dot(line);

    if (d < 0) return lineStart;
    if (d > len) return lineEnd;

    return lineStart.clone().add(line.multiplyScalar(d));
}

/**
 * Find closest point on a triangle to a given point
 */
export function closestPointOnTriangle(
    point: THREE.Vector3,
    v0: THREE.Vector3,
    v1: THREE.Vector3,
    v2: THREE.Vector3
): THREE.Vector3 {
    // Implementation of closest point on triangle
    const edge0 = v1.clone().sub(v0);
    const edge1 = v2.clone().sub(v0);
    const v = point.clone().sub(v0);

    const dot00 = edge0.dot(edge0);
    const dot01 = edge0.dot(edge1);
    const dot02 = edge0.dot(v);
    const dot11 = edge1.dot(edge1);
    const dot12 = edge1.dot(v);

    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v_coord = (dot00 * dot12 - dot01 * dot02) * invDenom;

    if (u >= 0 && v_coord >= 0 && u + v_coord <= 1) {
        // Point is inside triangle
        return v0.clone().add(edge0.multiplyScalar(u)).add(edge1.multiplyScalar(v_coord));
    }

    // Point is outside triangle, find closest point on edges
    const p1 = closestPointOnLineSegment(point, v0, v1);
    const p2 = closestPointOnLineSegment(point, v1, v2);
    const p3 = closestPointOnLineSegment(point, v2, v0);

    const d1 = point.distanceToSquared(p1);
    const d2 = point.distanceToSquared(p2);
    const d3 = point.distanceToSquared(p3);

    if (d1 < d2 && d1 < d3) return p1;
    if (d2 < d3) return p2;
    return p3;
}

/**
 * Calculate bounding box dimensions
 */
export function calculateBoundingBox(
    geometry: THREE.BufferGeometry
): { size: THREE.Vector3; center: THREE.Vector3; volume: number } {
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;

    if (!bbox) {
        return {
            size: new THREE.Vector3(),
            center: new THREE.Vector3(),
            volume: 0
        };
    }

    const size = new THREE.Vector3();
    bbox.getSize(size);

    const center = new THREE.Vector3();
    bbox.getCenter(center);

    const volume = size.x * size.y * size.z;

    return { size, center, volume };
}

/**
 * Calculate surface area of a mesh
 */
export function calculateSurfaceArea(
    geometry: THREE.BufferGeometry,
    unit: keyof typeof UNITS.AREA = 'SQUARE_METER'
): number {
    const positions = geometry.attributes.position;
    const indices = geometry.index;

    if (!positions || !indices) return 0;

    let area = 0;
    const vertices: THREE.Vector3[] = [];

    // Extract vertices
    for (let i = 0; i < positions.count; i++) {
        vertices.push(new THREE.Vector3(
            positions.getX(i),
            positions.getY(i),
            positions.getZ(i)
        ));
    }

    // Calculate area of each triangle
    for (let i = 0; i < indices.count; i += 3) {
        const a = vertices[indices.getX(i)];
        const b = vertices[indices.getY(i)];
        const c = vertices[indices.getZ(i)];

        // Triangle area using cross product
        const ab = b.clone().sub(a);
        const ac = c.clone().sub(a);
        const cross = new THREE.Vector3().crossVectors(ab, ac);

        area += cross.length() / 2;
    }

    return area / (UNITS.AREA[unit].factor ** 2);
}

/**
 * Create measurement line geometry
 */
export function createMeasurementLine(
    start: THREE.Vector3,
    end: THREE.Vector3,
    color: number = 0xff0000,
    thickness: number = 2
): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({
        color,
        linewidth: thickness,
    });

    return new THREE.Line(geometry, material);
}

/**
 * Create measurement point geometry
 */
export function createMeasurementPoint(
    position: THREE.Vector3,
    color: number = 0xff0000,
    size: number = 0.1
): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(size, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color });

    const point = new THREE.Mesh(geometry, material);
    point.position.copy(position);

    return point;
}

/**
 * Create measurement label (text sprite)
 */
export function createMeasurementLabel(
    text: string,
    position: THREE.Vector3,
    color: string = '#ffffff',
    backgroundColor: string = '#000000'
): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    canvas.width = 256;
    canvas.height = 128;

    // Background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Text
    context.fillStyle = color;
    context.font = 'bold 24px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    sprite.position.copy(position);
    sprite.scale.set(2, 1, 1);

    return sprite;
}

/**
 * Format measurement value with unit
 */
export function formatMeasurement(
    value: number,
    type: MeasurementType,
    unit?: string
): string {
    const formatted = value.toFixed(2);

    switch (type) {
        case 'distance':
            return unit ? `${formatted} ${unit}` : `${formatted} m`;
        case 'area':
            return unit ? `${formatted} ${unit}` : `${formatted} m²`;
        case 'volume':
            return unit ? `${formatted} ${unit}` : `${formatted} m³`;
        case 'angle':
            return `${formatted}°`;
        default:
            return formatted;
    }
}

/**
 * Validate measurement points
 */
export function validateMeasurementPoints(
    points: THREE.Vector3[],
    type: MeasurementType
): boolean {
    switch (type) {
        case 'distance':
            return points.length === 2;
        case 'area':
            return points.length >= 3;
        case 'volume':
            return points.length >= 4;
        case 'angle':
            return points.length === 3;
        default:
            return false;
    }
}

/**
 * Snap point to grid
 */
export function snapToGrid(
    point: THREE.Vector3,
    gridSize: number = 0.1
): THREE.Vector3 {
    return new THREE.Vector3(
        Math.round(point.x / gridSize) * gridSize,
        Math.round(point.y / gridSize) * gridSize,
        Math.round(point.z / gridSize) * gridSize
    );
}

/**
 * Snap point to geometry
 */
export function snapToGeometry(
    point: THREE.Vector3,
    geometry: THREE.BufferGeometry,
    threshold: number = 0.1
): THREE.Vector3 | null {
    const positions = geometry.attributes.position;
    if (!positions) return null;

    let closestPoint: THREE.Vector3 | null = null;
    let minDistance = Infinity;

    for (let i = 0; i < positions.count; i++) {
        const vertex = new THREE.Vector3(
            positions.getX(i),
            positions.getY(i),
            positions.getZ(i)
        );

        const distance = point.distanceTo(vertex);
        if (distance < minDistance && distance <= threshold) {
            minDistance = distance;
            closestPoint = vertex;
        }
    }

    return closestPoint;
}

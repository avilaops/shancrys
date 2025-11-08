/**
 * Hook for managing measurement state and operations in 3D viewer
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { MeasurementType, Measurement } from '@/types/global';
import {
    calculateDistance,
    calculatePolygonArea,
    calculateAngle,
    createMeasurementLine,
    createMeasurementPoint,
    createMeasurementLabel,
    formatMeasurement,
    validateMeasurementPoints,
} from '@/utils/measurementHelpers'; interface UseMeasurementOptions {
    snapToGrid?: boolean;
    gridSize?: number;
    snapToGeometry?: boolean;
    snapThreshold?: number;
    unit?: string;
}

interface MeasurementState {
    active: boolean;
    type: MeasurementType | null;
    points: THREE.Vector3[];
    measurements: Measurement[];
    selectedMeasurement: string | null;
    isSnapping: boolean;
}



export function useMeasurement(options: UseMeasurementOptions = {}) {
    // Always use latest options via ref
    const optionsRef = useRef<UseMeasurementOptions>({ ...options });
    useEffect(() => {
        optionsRef.current = { ...options };
    }, [options]);

    const [state, setState] = useState<MeasurementState>({
        active: false,
        type: null,
        points: [],
        measurements: [],
        selectedMeasurement: null,
        isSnapping: false,
    });

    const sceneRef = useRef<THREE.Scene | null>(null);
    const measurementObjectsRef = useRef<Map<string, THREE.Object3D[]>>(new Map());

    // Set scene reference
    const setScene = useCallback((scene: THREE.Scene) => {
        sceneRef.current = scene;
    }, []);



    // Start measurement
    const startMeasurement = useCallback((type: MeasurementType) => {
        setState(prev => ({
            ...prev,
            active: true,
            type,
            points: [],
        }));
    }, []);

    // Stop measurement
    const stopMeasurement = useCallback(() => {
        setState(prev => ({
            ...prev,
            active: false,
            type: null,
            points: [],
        }));
    }, []);

    // Clear all measurements
    const clearMeasurements = useCallback(() => {
        if (sceneRef.current) {
            measurementObjectsRef.current.forEach(objects => {
                objects.forEach(obj => {
                    sceneRef.current!.remove(obj);
                    if (obj instanceof THREE.Mesh) {
                        obj.geometry.dispose();
                        if (Array.isArray(obj.material)) {
                            obj.material.forEach(mat => mat.dispose());
                        } else {
                            obj.material.dispose();
                        }
                    }
                });
            });
        }

        measurementObjectsRef.current.clear();

        setState(prev => ({
            ...prev,
            measurements: [],
            selectedMeasurement: null,
        }));
    }, []);

    // Delete a specific measurement
    const deleteMeasurement = useCallback((id: string) => {
        // Remove from scene
        const objects = measurementObjectsRef.current.get(id);
        if (objects && sceneRef.current) {
            objects.forEach(obj => {
                sceneRef.current!.remove(obj);
                if (obj instanceof THREE.Mesh) {
                    obj.geometry.dispose();
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(mat => mat.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });
            measurementObjectsRef.current.delete(id);
        }

        // Remove from state
        setState(prev => ({
            ...prev,
            measurements: prev.measurements.filter(m => m.id !== id),
            selectedMeasurement: prev.selectedMeasurement === id ? null : prev.selectedMeasurement,
        }));
    }, []);

    // Select a measurement
    const selectMeasurement = useCallback((id: string | null) => {
        setState(prev => ({
            ...prev,
            selectedMeasurement: id,
        }));
    }, []);

    // Move createMeasurementFromPoints and renderMeasurement above addPoint

    // Create measurement from points
    const createMeasurementFromPoints = useCallback((
        points: THREE.Vector3[],
        type: MeasurementType
    ): Measurement | null => {
        try {
            let value: number;
            let displayUnit: string;
            const opts = optionsRef.current;

            switch (type) {
                case 'distance':
                    if (points.length !== 2) return null;
                    value = calculateDistance(points[0], points[1]);
                    displayUnit = opts.unit || 'm';
                    break;

                case 'area':
                    if (points.length < 3) return null;
                    value = calculatePolygonArea(points);
                    displayUnit = opts.unit || 'm²';
                    break;

                case 'angle':
                    if (points.length !== 3) return null;
                    value = calculateAngle(points[1], points[0], points[2]);
                    displayUnit = '°';
                    break;

                default:
                    return null;
            }

            return {
                id: `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type,
                points: [...points],
                value,
                unit: displayUnit,
                label: formatMeasurement(value, type, displayUnit),
            };
        } catch (error) {
            console.error('Error creating measurement:', error);
            return null;
        }
    }, []);

    // Render measurement in scene
    const renderMeasurement = useCallback((measurement: Measurement) => {
        if (!sceneRef.current) return;

        const objects: THREE.Object3D[] = [];

        // Create points
        measurement.points.forEach(point => {
            const pointObj = createMeasurementPoint(point);
            objects.push(pointObj);
            sceneRef.current!.add(pointObj);
        });

        // Create lines/labels based on type
        switch (measurement.type) {
            case 'distance':
                if (measurement.points.length >= 2) {
                    const line = createMeasurementLine(measurement.points[0], measurement.points[1]);
                    const label = createMeasurementLabel(measurement.label ?? '', measurement.points[1]);

                    objects.push(line, label);
                    sceneRef.current!.add(line);
                    sceneRef.current!.add(label);
                }
                break;

            case 'area':
                if (measurement.points.length >= 3) {
                    // Create polygon outline
                    for (let i = 0; i < measurement.points.length; i++) {
                        const start = measurement.points[i];
                        const end = measurement.points[(i + 1) % measurement.points.length];
                        const line = createMeasurementLine(start, end);
                        objects.push(line);
                        sceneRef.current!.add(line);
                    }

                    // Calculate centroid for label
                    const centroid = new THREE.Vector3();
                    measurement.points.forEach(point => centroid.add(point));
                    centroid.divideScalar(measurement.points.length);

                    const label = createMeasurementLabel(measurement.label ?? '', centroid);
                    objects.push(label);
                    sceneRef.current!.add(label);
                }
                break;

            case 'angle':
                if (measurement.points.length >= 3) {
                    // Create angle lines
                    const line1 = createMeasurementLine(measurement.points[1], measurement.points[0]);
                    const line2 = createMeasurementLine(measurement.points[1], measurement.points[2]);

                    objects.push(line1, line2);
                    sceneRef.current!.add(line1);
                    sceneRef.current!.add(line2);

                    // Label at vertex
                    const label = createMeasurementLabel(measurement.label ?? '', measurement.points[1]);
                    objects.push(label);
                    sceneRef.current!.add(label);
                }
                break;
        }

        measurementObjectsRef.current.set(measurement.id, objects);
    }, []);

    // Add point to current measurement
    const addPoint = useCallback((point: THREE.Vector3, geometry?: THREE.BufferGeometry) => {
        setState(prev => {
            if (!prev.active || !prev.type) return prev;

            let snappedPoint = point.clone();
            const opts = optionsRef.current;

            // Snap to geometry if enabled
            if (opts.snapToGeometry && geometry) {
                // TODO: Implement geometry snapping
                // const snapped = snapToGeometry(point, geometry, opts.snapThreshold);
                // if (snapped) {
                //   snappedPoint = snapped;
                //   setState(s => ({ ...s, isSnapping: true }));
                // }
            }
            // Snap to grid if enabled
            if (opts.snapToGrid && !state.isSnapping) {
                const grid = opts.gridSize ?? 0.1;
                snappedPoint = new THREE.Vector3(
                    Math.round(snappedPoint.x / grid) * grid,
                    Math.round(snappedPoint.y / grid) * grid,
                    Math.round(snappedPoint.z / grid) * grid
                );
            }

            const newPoints = [...prev.points, snappedPoint];

            // Check if we have enough points for the measurement type
            if (validateMeasurementPoints(newPoints, prev.type)) {
                const measurement = createMeasurementFromPoints(newPoints, prev.type);
                if (measurement) {
                    const newMeasurements = [...prev.measurements, measurement];
                    renderMeasurement(measurement);

                    return {
                        ...prev,
                        points: [],
                        measurements: newMeasurements,
                        active: false,
                        type: null,
                    };
                }
            }

            return {
                ...prev,
                points: newPoints,
            };
        });
    }, [state.isSnapping, createMeasurementFromPoints, renderMeasurement]);


    // Remove duplicate createMeasurementFromPoints and renderMeasurement

    // Fix createMeasurementLabel calls in the remaining renderMeasurement implementation:
    // (distance)
    // const label = createMeasurementLabel(measurement.label ?? '', measurement.points[1]);
    // (area)
    // const label = createMeasurementLabel(measurement.label ?? '', centroid);
    // (angle)
    // const label = createMeasurementLabel(measurement.label ?? '', measurement.points[1]);

    // ...existing code...
    // (restante do hook segue normalmente)

    // Retorna API do hook
    return {
        // State
        measurements: state.measurements,
        active: state.active,
        currentType: state.type,
        currentPoints: state.points,
        selectedMeasurement: state.selectedMeasurement,
        isSnapping: state.isSnapping,

        // Actions
        startMeasurement,
        stopMeasurement,
        addPoint,
        clearMeasurements,
        deleteMeasurement,
        selectMeasurement,

        // Utilities
        setScene,
    };
}

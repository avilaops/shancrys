/**
 * Hook for managing section planes in 3D viewer
 * Supports clipping planes for X, Y, Z axes and arbitrary planes
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';

export type SectionPlaneAxis = 'X' | 'Y' | 'Z' | 'custom';

export interface SectionPlane {
    id: string;
    name: string;
    axis: SectionPlaneAxis;
    position: number;
    normal: THREE.Vector3;
    constant: number;
    enabled: boolean;
    inverted: boolean;
}

interface UseSectionPlaneOptions {
    maxPlanes?: number;
}

interface SectionPlaneState {
    planes: SectionPlane[];
    activePlane: string | null;
    showHelpers: boolean;
}

export function useSectionPlane(options: UseSectionPlaneOptions = {}) {
    const { maxPlanes = 6 } = options;

    const [state, setState] = useState<SectionPlaneState>({
        planes: [],
        activePlane: null,
        showHelpers: true,
    });

    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const helperObjectsRef = useRef<Map<string, THREE.Object3D>>(new Map());

    // Set renderer reference
    const setRenderer = useCallback((renderer: THREE.WebGLRenderer) => {
        rendererRef.current = renderer;

        // Enable clipping planes
        if (renderer) {
            renderer.localClippingEnabled = true;
        }
    }, []);

    // Update renderer clipping planes
    const updateRendererPlanes = useCallback((planes: SectionPlane[]) => {
        if (!rendererRef.current) return;

        const activePlanes = planes
            .filter(p => p.enabled)
            .map(p => {
                const plane = new THREE.Plane(p.normal.clone(), p.constant);
                if (p.inverted) {
                    plane.negate();
                }
                return plane;
            });

        rendererRef.current.clippingPlanes = activePlanes;
    }, []);

    // Create a section plane
    const createPlane = useCallback((
        axis: SectionPlaneAxis,
        position: number = 0,
        name?: string
    ): SectionPlane | null => {
        if (state.planes.length >= maxPlanes) {
            console.warn(`Maximum number of planes (${maxPlanes}) reached`);
            return null;
        }

        let normal: THREE.Vector3;
        let constant: number;

        switch (axis) {
            case 'X':
                normal = new THREE.Vector3(1, 0, 0);
                constant = -position;
                break;
            case 'Y':
                normal = new THREE.Vector3(0, 1, 0);
                constant = -position;
                break;
            case 'Z':
                normal = new THREE.Vector3(0, 0, 1);
                constant = -position;
                break;
            case 'custom':
                // For custom planes, position is not used directly
                normal = new THREE.Vector3(1, 0, 0);
                constant = 0;
                break;
            default:
                return null;
        }

        const id = `plane_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const plane: SectionPlane = {
            id,
            name: name || `${axis} Plane`,
            axis,
            position,
            normal,
            constant,
            enabled: true,
            inverted: false,
        };

        setState(prev => {
            const newPlanes = [...prev.planes, plane];
            updateRendererPlanes(newPlanes);
            return {
                ...prev,
                planes: newPlanes,
                activePlane: id,
            };
        });

        return plane;
    }, [state.planes.length, maxPlanes, updateRendererPlanes]);

    // Update plane position
    const updatePlanePosition = useCallback((id: string, position: number) => {
        setState(prev => {
            const newPlanes = prev.planes.map(p => {
                if (p.id !== id) return p;

                let constant: number;
                switch (p.axis) {
                    case 'X':
                    case 'Y':
                    case 'Z':
                        constant = -position;
                        break;
                    default:
                        constant = p.constant;
                }

                return {
                    ...p,
                    position,
                    constant,
                };
            });

            updateRendererPlanes(newPlanes);
            return { ...prev, planes: newPlanes };
        });
    }, [updateRendererPlanes]);

    // Update plane normal and constant (for custom planes)
    const updatePlaneNormal = useCallback((
        id: string,
        normal: THREE.Vector3,
        constant: number
    ) => {
        setState(prev => {
            const newPlanes = prev.planes.map(p => {
                if (p.id !== id) return p;
                return {
                    ...p,
                    normal: normal.clone().normalize(),
                    constant,
                };
            });

            updateRendererPlanes(newPlanes);
            return { ...prev, planes: newPlanes };
        });
    }, [updateRendererPlanes]);

    // Toggle plane enabled state
    const togglePlane = useCallback((id: string) => {
        setState(prev => {
            const newPlanes = prev.planes.map(p =>
                p.id === id ? { ...p, enabled: !p.enabled } : p
            );

            updateRendererPlanes(newPlanes);
            return { ...prev, planes: newPlanes };
        });
    }, [updateRendererPlanes]);

    // Invert plane direction
    const invertPlane = useCallback((id: string) => {
        setState(prev => {
            const newPlanes = prev.planes.map(p =>
                p.id === id ? { ...p, inverted: !p.inverted } : p
            );

            updateRendererPlanes(newPlanes);
            return { ...prev, planes: newPlanes };
        });
    }, [updateRendererPlanes]);

    // Delete a plane
    const deletePlane = useCallback((id: string) => {
        // Remove helper objects
        const helper = helperObjectsRef.current.get(id);
        if (helper && helper.parent) {
            helper.parent.remove(helper);
        }
        helperObjectsRef.current.delete(id);

        setState(prev => {
            const newPlanes = prev.planes.filter(p => p.id !== id);
            updateRendererPlanes(newPlanes);

            return {
                ...prev,
                planes: newPlanes,
                activePlane: prev.activePlane === id ? null : prev.activePlane,
            };
        });
    }, [updateRendererPlanes]);

    // Clear all planes
    const clearPlanes = useCallback(() => {
        // Remove all helper objects
        helperObjectsRef.current.forEach(helper => {
            if (helper.parent) {
                helper.parent.remove(helper);
            }
        });
        helperObjectsRef.current.clear();

        setState(prev => {
            updateRendererPlanes([]);
            return {
                ...prev,
                planes: [],
                activePlane: null,
            };
        });
    }, [updateRendererPlanes]);

    // Select active plane
    const selectPlane = useCallback((id: string | null) => {
        setState(prev => ({
            ...prev,
            activePlane: id,
        }));
    }, []);

    // Toggle helper visibility
    const toggleHelpers = useCallback(() => {
        setState(prev => ({
            ...prev,
            showHelpers: !prev.showHelpers,
        }));

        helperObjectsRef.current.forEach(helper => {
            helper.visible = !state.showHelpers;
        });
    }, [state.showHelpers]);

    // Create helper for a plane (visual representation)
    const createPlaneHelper = useCallback((
        plane: SectionPlane,
        scene: THREE.Scene,
        size: number = 10
    ) => {
        const helper = new THREE.PlaneHelper(
            new THREE.Plane(plane.normal, plane.constant),
            size,
            0xff0000
        );
        helper.visible = state.showHelpers;
        scene.add(helper);
        helperObjectsRef.current.set(plane.id, helper);
        return helper;
    }, [state.showHelpers]);

    // Update helper when plane changes
    useEffect(() => {
        state.planes.forEach(plane => {
            const helper = helperObjectsRef.current.get(plane.id);
            if (helper && helper instanceof THREE.PlaneHelper) {
                const clippingPlane = new THREE.Plane(plane.normal, plane.constant);
                if (plane.inverted) {
                    clippingPlane.negate();
                }
                // Update helper plane
                // PlaneHelper has a plane property that needs to be updated
                const planeHelper = helper as THREE.PlaneHelper & { plane: THREE.Plane };
                planeHelper.plane = clippingPlane;
            }
        });
    }, [state.planes]);

    return {
        // State
        planes: state.planes,
        activePlane: state.activePlane,
        showHelpers: state.showHelpers,

        // Actions
        createPlane,
        updatePlanePosition,
        updatePlaneNormal,
        togglePlane,
        invertPlane,
        deletePlane,
        clearPlanes,
        selectPlane,
        toggleHelpers,
        createPlaneHelper,

        // Utilities
        setRenderer,
    };
}

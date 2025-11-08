import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import type { IfcModel as IfcModelType } from '../hooks/useIfcLoader';
import type { ElementAnimationState } from '../hooks/use4DAnimation';

interface IfcModelProps {
    model: IfcModelType;
    onElementClick?: (elementId: number | null) => void;
    selectedElement?: number | null;
    animationStates?: Map<number, ElementAnimationState>;
}

export default function IfcModel({ model, onElementClick, selectedElement, animationStates }: IfcModelProps) {
    const groupRef = useRef<THREE.Group>(null);
    const meshesRef = useRef<Map<number, THREE.Mesh>>(new Map());
    const [hoveredElement, setHoveredElement] = useState<number | null>(null);
    const { gl, camera } = useThree();
    const raycaster = useRef(new THREE.Raycaster());
    const pointer = useRef(new THREE.Vector2());

    useEffect(() => {
        if (!groupRef.current) return;

        // Clear existing meshes
        while (groupRef.current.children.length > 0) {
            const child = groupRef.current.children[0];
            groupRef.current.remove(child);
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                if (child.material instanceof THREE.Material) {
                    child.material.dispose();
                }
            }
        }
        meshesRef.current.clear();

        // Add new meshes
        model.elements.forEach((element) => {
            const mesh = new THREE.Mesh(element.geometry, element.material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = {
                elementId: element.id,
                type: element.type,
                properties: element.properties,
            };

            groupRef.current?.add(mesh);
            meshesRef.current.set(element.id, mesh);
        });

        // Center and scale model
        const box = new THREE.Box3().setFromObject(groupRef.current);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        groupRef.current.position.x = -center.x;
        groupRef.current.position.y = -box.min.y;
        groupRef.current.position.z = -center.z;

        // Scale if model is too large or too small
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 200) {
            const scale = 200 / maxDim;
            groupRef.current.scale.setScalar(scale);
        }

    }, [model]);

    // Handle 4D animation states
    useEffect(() => {
        if (!animationStates) return;

        meshesRef.current.forEach((mesh, id) => {
            const state = animationStates.get(id);
            if (state) {
                mesh.visible = state.visible;
                (mesh.material as THREE.MeshStandardMaterial).transparent = state.opacity < 1;
                (mesh.material as THREE.MeshStandardMaterial).opacity = state.opacity;

                // Pulse effect for active elements
                if (state.isActive) {
                    (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xffd700);
                    (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.15;
                }
            }
        });
    }, [animationStates]);

    // Handle selection highlighting
    useEffect(() => {
        meshesRef.current.forEach((mesh, id) => {
            const state = animationStates?.get(id);

            // Skip if element is invisible due to 4D
            if (state && !state.visible) return;

            if (id === selectedElement) {
                // Highlight selected element
                (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x2563eb);
                (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
            } else if (id === hoveredElement) {
                // Subtle hover effect
                (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x3b82f6);
                (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
            } else if (state?.isActive) {
                // Keep active state if not selected or hovered
                (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xffd700);
                (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.15;
            } else {
                // Reset to default
                (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
                (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
            }
        });
    }, [selectedElement, hoveredElement, animationStates]);

    // Mouse interaction handlers
    useEffect(() => {
        const canvas = gl.domElement;

        const handlePointerMove = (event: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.current.setFromCamera(pointer.current, camera);
            const intersects = raycaster.current.intersectObjects(
                Array.from(meshesRef.current.values()),
                false
            );

            if (intersects.length > 0) {
                const elementId = intersects[0].object.userData.elementId;
                setHoveredElement(elementId);
                canvas.style.cursor = 'pointer';
            } else {
                setHoveredElement(null);
                canvas.style.cursor = 'default';
            }
        };

        const handleClick = (event: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.current.setFromCamera(pointer.current, camera);
            const intersects = raycaster.current.intersectObjects(
                Array.from(meshesRef.current.values()),
                false
            );

            if (intersects.length > 0 && onElementClick) {
                const elementId = intersects[0].object.userData.elementId;
                onElementClick(elementId);
            } else if (onElementClick) {
                onElementClick(null);
            }
        };

        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('click', handleClick);

        return () => {
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('click', handleClick);
        };
    }, [gl, camera, onElementClick]);

    return <group ref={groupRef} />;
}

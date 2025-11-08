import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface ViewerSettings {
    backgroundColor: number;
    gridHelper: boolean;
    axesHelper: boolean;
    ambientLightIntensity: number;
    directionalLightIntensity: number;
}

export interface Use3DViewerReturn {
    containerRef: React.RefObject<HTMLDivElement | null>;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    controls: OrbitControls | null;
    isReady: boolean;
    addObject: (object: THREE.Object3D) => void;
    removeObject: (object: THREE.Object3D) => void;
    clearScene: () => void;
    resetCamera: () => void;
    fitToView: () => void;
    updateSettings: (settings: Partial<ViewerSettings>) => void;
}

const defaultSettings: ViewerSettings = {
    backgroundColor: 0xf0f0f0,
    gridHelper: true,
    axesHelper: true,
    ambientLightIntensity: 0.6,
    directionalLightIntensity: 0.8,
};

export function use3DViewer(customSettings?: Partial<ViewerSettings>): Use3DViewerReturn {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scene, setScene] = useState<THREE.Scene | null>(null);
    const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
    const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
    const [controls, setControls] = useState<OrbitControls | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [settings, setSettings] = useState<ViewerSettings>({ ...defaultSettings, ...customSettings });

    const gridHelperRef = useRef<THREE.GridHelper | null>(null);
    const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
    const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
    const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);

    // Inicialização do Three.js
    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Scene
        const newScene = new THREE.Scene();
        newScene.background = new THREE.Color(settings.backgroundColor);
        setScene(newScene);

        // Camera
        const newCamera = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        newCamera.position.set(50, 50, 50);
        newCamera.lookAt(0, 0, 0);
        setCamera(newCamera);

        // Renderer
        const newRenderer = new THREE.WebGLRenderer({ antialias: true });
        newRenderer.setSize(container.clientWidth, container.clientHeight);
        newRenderer.setPixelRatio(window.devicePixelRatio);
        newRenderer.shadowMap.enabled = true;
        newRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(newRenderer.domElement);
        setRenderer(newRenderer);

        // Controls
        const newControls = new OrbitControls(newCamera, newRenderer.domElement);
        newControls.enableDamping = true;
        newControls.dampingFactor = 0.05;
        newControls.screenSpacePanning = false;
        newControls.minDistance = 1;
        newControls.maxDistance = 500;
        newControls.maxPolarAngle = Math.PI / 2;
        setControls(newControls);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, settings.ambientLightIntensity);
        newScene.add(ambientLight);
        ambientLightRef.current = ambientLight;

        const directionalLight = new THREE.DirectionalLight(0xffffff, settings.directionalLightIntensity);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        newScene.add(directionalLight);
        directionalLightRef.current = directionalLight;

        // Grid Helper
        if (settings.gridHelper) {
            const gridHelper = new THREE.GridHelper(100, 100, 0x888888, 0xcccccc);
            newScene.add(gridHelper);
            gridHelperRef.current = gridHelper;
        }

        // Axes Helper
        if (settings.axesHelper) {
            const axesHelper = new THREE.AxesHelper(10);
            newScene.add(axesHelper);
            axesHelperRef.current = axesHelper;
        }

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            newControls.update();
            newRenderer.render(newScene, newCamera);
        }
        animate();

        // Handle window resize
        function handleResize() {
            if (!containerRef.current) return;

            newCamera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            newCamera.updateProjectionMatrix();
            newRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        }
        window.addEventListener('resize', handleResize);

        setIsReady(true);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            newRenderer.dispose();
            newControls.dispose();
            if (container && newRenderer.domElement.parentNode === container) {
                container.removeChild(newRenderer.domElement);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Atualizar configurações
    useEffect(() => {
        if (!scene) return;

        scene.background = new THREE.Color(settings.backgroundColor);

        if (ambientLightRef.current) {
            ambientLightRef.current.intensity = settings.ambientLightIntensity;
        }

        if (directionalLightRef.current) {
            directionalLightRef.current.intensity = settings.directionalLightIntensity;
        }

        if (settings.gridHelper && !gridHelperRef.current) {
            const gridHelper = new THREE.GridHelper(100, 100, 0x888888, 0xcccccc);
            scene.add(gridHelper);
            gridHelperRef.current = gridHelper;
        } else if (!settings.gridHelper && gridHelperRef.current) {
            scene.remove(gridHelperRef.current);
            gridHelperRef.current = null;
        }

        if (settings.axesHelper && !axesHelperRef.current) {
            const axesHelper = new THREE.AxesHelper(10);
            scene.add(axesHelper);
            axesHelperRef.current = axesHelper;
        } else if (!settings.axesHelper && axesHelperRef.current) {
            scene.remove(axesHelperRef.current);
            axesHelperRef.current = null;
        }
    }, [settings, scene]);

    const addObject = (object: THREE.Object3D) => {
        if (scene) {
            scene.add(object);
        }
    };

    const removeObject = (object: THREE.Object3D) => {
        if (scene) {
            scene.remove(object);
        }
    };

    const clearScene = () => {
        if (!scene) return;

        // Remove all objects except lights and helpers
        const objectsToRemove: THREE.Object3D[] = [];
        scene.traverse((object) => {
            if (
                object !== gridHelperRef.current &&
                object !== axesHelperRef.current &&
                object !== ambientLightRef.current &&
                object !== directionalLightRef.current &&
                object !== scene
            ) {
                objectsToRemove.push(object);
            }
        });

        objectsToRemove.forEach((object) => {
            scene.remove(object);
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                if (Array.isArray(object.material)) {
                    object.material.forEach((mat) => mat.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    };

    const resetCamera = () => {
        if (camera && controls) {
            camera.position.set(50, 50, 50);
            camera.lookAt(0, 0, 0);
            controls.target.set(0, 0, 0);
            controls.update();
        }
    };

    const fitToView = () => {
        if (!scene || !camera || !controls) return;

        const box = new THREE.Box3();
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                box.expandByObject(object);
            }
        });

        if (box.isEmpty()) return;

        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // Add some padding

        camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();
    };

    const updateSettings = (newSettings: Partial<ViewerSettings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    return {
        containerRef,
        scene,
        camera,
        renderer,
        controls,
        isReady,
        addObject,
        removeObject,
        clearScene,
        resetCamera,
        fitToView,
        updateSettings,
    };
}

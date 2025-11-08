import { useEffect, useState } from 'react';
import { use3DViewer } from '../hooks/use3DViewer';
import * as THREE from 'three';
import {
    Camera,
    Grid3x3,
    Move,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Upload,
    Settings
} from 'lucide-react';

interface Viewer3DProps {
    onModelLoad?: (model: THREE.Object3D) => void;
    onElementSelect?: (element: THREE.Object3D | null) => void;
}

export default function Viewer3D({ onModelLoad, onElementSelect }: Viewer3DProps) {
    const {
        containerRef,
        scene,
        camera,
        isReady,
        addObject,
        clearScene,
        resetCamera,
        fitToView,
        updateSettings,
    } = use3DViewer({
        backgroundColor: 0xf5f5f5,
        gridHelper: true,
        axesHelper: true,
    });

    const [showGrid, setShowGrid] = useState(true);
    const [showAxes, setShowAxes] = useState(true);
    const [selectedElement, setSelectedElement] = useState<THREE.Object3D | null>(null);

    // Criar um modelo de exemplo (cubo) para demonstração
    useEffect(() => {
        if (!isReady || !scene) return;

        // Exemplo: Adicionar um cubo colorido
        const geometry = new THREE.BoxGeometry(10, 10, 10);
        const material = new THREE.MeshStandardMaterial({
            color: 0x3b82f6,
            metalness: 0.3,
            roughness: 0.4,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 5, 0);
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.userData.name = 'Example Building Element';
        cube.userData.type = 'Wall';

        addObject(cube);

        // Adicionar um plano (chão)
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            side: THREE.DoubleSide,
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true;
        plane.userData.name = 'Ground';

        addObject(plane);

        if (onModelLoad) {
            onModelLoad(cube);
        }

        fitToView();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, scene]);    // Raycaster para seleção de elementos
    useEffect(() => {
        if (!containerRef.current || !camera || !scene) return;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function onMouseClick(event: MouseEvent) {
            if (!containerRef.current || !camera || !scene) return;

            const rect = containerRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                const clickedObject = intersects[0].object;

                // Deselecionar anterior
                if (selectedElement && selectedElement instanceof THREE.Mesh) {
                    const material = selectedElement.material as THREE.MeshStandardMaterial;
                    material.emissive.setHex(0x000000);
                }

                // Selecionar novo
                if (clickedObject instanceof THREE.Mesh && clickedObject.userData.name !== 'Ground') {
                    const material = clickedObject.material as THREE.MeshStandardMaterial;
                    material.emissive.setHex(0xff9900);
                    setSelectedElement(clickedObject);

                    if (onElementSelect) {
                        onElementSelect(clickedObject);
                    }
                }
            } else {
                // Clique no vazio - deselecionar
                if (selectedElement && selectedElement instanceof THREE.Mesh) {
                    const material = selectedElement.material as THREE.MeshStandardMaterial;
                    material.emissive.setHex(0x000000);
                }
                setSelectedElement(null);
                if (onElementSelect) {
                    onElementSelect(null);
                }
            }
        }

        containerRef.current.addEventListener('click', onMouseClick);
        const currentContainer = containerRef.current;

        return () => {
            if (currentContainer) {
                currentContainer.removeEventListener('click', onMouseClick);
            }
        };
    }, [camera, scene, selectedElement, containerRef, onElementSelect]);

    const handleToggleGrid = () => {
        setShowGrid(!showGrid);
        updateSettings({ gridHelper: !showGrid });
    };

    const handleToggleAxes = () => {
        setShowAxes(!showAxes);
        updateSettings({ axesHelper: !showAxes });
    };

    const handleClearScene = () => {
        clearScene();
        setSelectedElement(null);
        if (onElementSelect) {
            onElementSelect(null);
        }
    };

    return (
        <div className="relative w-full h-full bg-gray-100">
            {/* Viewer Container */}
            <div ref={containerRef} className="w-full h-full" />

            {/* Toolbar - Top */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                {/* Left Toolbar */}
                <div className="bg-white rounded-lg shadow-lg p-2 flex gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Upload IFC"
                    >
                        <Upload className="w-5 h-5 text-gray-700" />
                    </button>
                    <input
                        ref={(ref) => { fileInputRef.current = ref; }}
                        type="file"
                        accept=".ifc"
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                                console.log('IFC file selected:', e.target.files[0].name);
                                // TODO: Implementar carregamento IFC
                            }
                        }}
                    />
                    <div className="w-px bg-gray-300" />
                    <button
                        onClick={handleClearScene}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Limpar Cena"
                    >
                        <RotateCcw className="w-5 h-5 text-gray-700" />
                    </button>
                </div>

                {/* Right Toolbar */}
                <div className="bg-white rounded-lg shadow-lg p-2">
                    <button
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Configurações"
                    >
                        <Settings className="w-5 h-5 text-gray-700" />
                    </button>
                </div>
            </div>

            {/* Camera Controls - Right */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
                <button
                    onClick={resetCamera}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Reset Camera"
                >
                    <Camera className="w-5 h-5 text-gray-700" />
                </button>
                <button
                    onClick={fitToView}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Fit to View"
                >
                    <Maximize2 className="w-5 h-5 text-gray-700" />
                </button>
                <div className="w-full h-px bg-gray-300" />
                <button
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                </button>
                <button
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-5 h-5 text-gray-700" />
                </button>
            </div>

            {/* View Controls - Bottom Right */}
            <div className="absolute right-4 bottom-4 bg-white rounded-lg shadow-lg p-2 flex gap-2">
                <button
                    onClick={handleToggleGrid}
                    className={`p-2 rounded transition-colors ${showGrid ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    title="Toggle Grid"
                >
                    <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                    onClick={handleToggleAxes}
                    className={`p-2 rounded transition-colors ${showAxes ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    title="Toggle Axes"
                >
                    <Move className="w-5 h-5" />
                </button>
            </div>

            {/* Info Panel - Bottom Left */}
            {selectedElement && (
                <div className="absolute left-4 bottom-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Element Selected</h3>
                    <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                            <span className="font-medium">Name:</span>{' '}
                            {selectedElement.userData.name || 'Unnamed'}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Type:</span>{' '}
                            {selectedElement.userData.type || 'Unknown'}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Position:</span>{' '}
                            ({selectedElement.position.x.toFixed(2)}, {selectedElement.position.y.toFixed(2)},{' '}
                            {selectedElement.position.z.toFixed(2)})
                        </p>
                    </div>
                </div>
            )}

            {/* Loading Indicator */}
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-700 font-medium">Inicializando visualizador 3D...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Ref para o input de arquivo
const fileInputRef = { current: null as HTMLInputElement | null };

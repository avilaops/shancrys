import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Stats } from '@react-three/drei';
import { Suspense, useRef, useState, useMemo, useEffect } from 'react';
import { Menu, Upload, Layers, Eye, EyeOff, Search, Clock, Settings, X, Loader2, Ruler, Scissors, GitCompare, MessageSquare, AlertTriangle } from 'lucide-react';
import { useIfcLoader } from '../hooks/useIfcLoader';
import IfcModel from '../components/IfcModel';
import PropertiesPanel from '../components/PropertiesPanel';
import Timeline from '../components/Timeline';
import { MeasurementTools } from '../components/MeasurementTools';
import { SectionPlane } from '../components/SectionPlane';
import { ModelComparator } from '../components/ModelComparator';
import { IssuesRFI, type Issue } from '../components/IssuesRFI';
import { ClashDetection } from '../components/ClashDetection';
import { generateMockActivities, getTimelineDateRange, assignElementsToActivities } from '../utils/mockActivities';
import { use4DAnimation } from '../hooks/use4DAnimation';
import type { Clash } from '../services/clashDetectionService';

export default function Viewer() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedElement, setSelectedElement] = useState<number | null>(null);
    const [timelineEnabled, setTimelineEnabled] = useState(false);
    const [measurementToolsOpen, setMeasurementToolsOpen] = useState(false);
    const [sectionPlaneOpen, setSectionPlaneOpen] = useState(false);
    const [comparatorOpen, setComparatorOpen] = useState(false);
    const [issuesOpen, setIssuesOpen] = useState(false);
    const [clashDetectionOpen, setClashDetectionOpen] = useState(false);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [highlightedElements, setHighlightedElements] = useState<number[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { model, loading, error, progress, loadIfc, clearModel } = useIfcLoader();

    // Log highlighted elements for debugging (will be used for visual feedback later)
    useEffect(() => {
        if (highlightedElements.length > 0) {
            console.log('Highlighted elements:', highlightedElements);
        }
    }, [highlightedElements]);

    // Timeline state with element assignment
    const baseActivities = useMemo(() => generateMockActivities(), []);
    const activities = useMemo(() => {
        if (!model) return baseActivities;
        return assignElementsToActivities(baseActivities, model.elements);
    }, [baseActivities, model]);

    const { minDate, maxDate } = useMemo(() => getTimelineDateRange(activities), [activities]);
    const [currentDate, setCurrentDate] = useState(minDate);

    // Reset timeline when toggling
    useEffect(() => {
        if (timelineEnabled) {
            setCurrentDate(minDate);
        }
    }, [timelineEnabled, minDate]);

    // 4D Animation states
    const animationStates = use4DAnimation(activities, currentDate, timelineEnabled); return (
        <div className="h-screen w-screen flex flex-col bg-gray-900">
            {/* Toolbar */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition"
                    >
                        <Menu className="w-5 h-5 text-gray-300" />
                    </button>
                    <h1 className="text-white font-semibold">Edifício Comercial Demo</h1>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".ifc"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) loadIfc(file);
                        }}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {loading ? `Carregando ${Math.round(progress)}%` : 'Importar IFC'}
                    </button>
                    {model && (
                        <button
                            onClick={clearModel}
                            className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-300"
                            title="Limpar modelo"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={() => setTimelineEnabled(!timelineEnabled)}
                        className={`p-2 rounded-lg transition ${timelineEnabled
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-700 text-gray-300'
                            }`}
                        title="Timeline 4D"
                    >
                        <Clock className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setMeasurementToolsOpen(!measurementToolsOpen)}
                        className={`p-2 rounded-lg transition ${measurementToolsOpen
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-700 text-gray-300'
                            }`}
                        title="Ferramentas de Medição"
                    >
                        <Ruler className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setSectionPlaneOpen(!sectionPlaneOpen)}
                        className={`p-2 rounded-lg transition ${sectionPlaneOpen
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-700 text-gray-300'
                            }`}
                        title="Planos de Corte"
                    >
                        <Scissors className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setComparatorOpen(!comparatorOpen)}
                        className={`p-2 rounded-lg transition ${comparatorOpen
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-700 text-gray-300'
                            }`}
                        title="Comparar Modelos"
                    >
                        <GitCompare className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIssuesOpen(!issuesOpen)}
                        className={`p-2 rounded-lg transition ${issuesOpen
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-700 text-gray-300'
                            }`}
                        title="Issues & RFI"
                    >
                        <MessageSquare className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setClashDetectionOpen(!clashDetectionOpen)}
                        className={`p-2 rounded-lg transition ${clashDetectionOpen
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-700 text-gray-300'
                            }`}
                        title="Detecção de Conflitos"
                    >
                        <AlertTriangle className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition">
                        <Settings className="w-5 h-5 text-gray-300" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                {sidebarOpen && (
                    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
                        <div className="p-4 border-b border-gray-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar elementos..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <h3 className="text-gray-400 text-sm font-semibold mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Elementos do Modelo
                            </h3>

                            {loading ? (
                                <div className="text-center py-12">
                                    <Loader2 className="w-12 h-12 mx-auto mb-3 text-primary-500 animate-spin" />
                                    <p className="text-white font-semibold">Carregando modelo IFC...</p>
                                    <p className="text-sm text-gray-400 mt-2">{Math.round(progress)}%</p>
                                    <div className="mt-4 mx-auto w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12 text-red-400">
                                    <X className="w-12 h-12 mx-auto mb-3" />
                                    <p className="font-semibold">Erro ao carregar</p>
                                    <p className="text-sm mt-2">{error}</p>
                                </div>
                            ) : !model ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Nenhum modelo carregado</p>
                                    <p className="text-sm mt-2">Importe um arquivo IFC</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {/* Group elements by type */}
                                    {Object.entries(
                                        model.elements.reduce((acc, el) => {
                                            acc[el.type] = (acc[el.type] || 0) + 1;
                                            return acc;
                                        }, {} as Record<string, number>)
                                    ).map(([type, count]) => (
                                        <ElementNode key={type} name={type} count={count} level={0} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-700">
                            <div className="text-sm text-gray-400">
                                <div className="flex justify-between mb-1">
                                    <span>Elementos:</span>
                                    <span className="text-white">{model?.totalElements.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Selecionados:</span>
                                    <span className="text-primary-400">{selectedElement ? '1' : '0'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3D Viewport */}
                <div className="flex-1 relative">
                    <Canvas shadows>
                        <Suspense fallback={<LoadingScreen />}>
                            <PerspectiveCamera makeDefault position={[50, 50, 50]} fov={50} />
                            <OrbitControls makeDefault />

                            {/* Lighting */}
                            <ambientLight intensity={0.4} />
                            <directionalLight
                                position={[50, 100, 50]}
                                intensity={1}
                                castShadow
                                shadow-mapSize={[2048, 2048]}
                            />
                            <directionalLight position={[-50, 50, -50]} intensity={0.3} />

                            {/* Scene */}
                            {model ? (
                                <IfcModel
                                    model={model}
                                    onElementClick={setSelectedElement}
                                    selectedElement={selectedElement}
                                    animationStates={animationStates}
                                />
                            ) : (
                                <DemoBuilding />
                            )}

                            {/* Grid */}
                            <Grid
                                args={[200, 200]}
                                cellSize={5}
                                cellThickness={0.5}
                                cellColor="#6b7280"
                                sectionSize={25}
                                sectionThickness={1}
                                sectionColor="#9ca3af"
                                fadeDistance={400}
                                fadeStrength={1}
                                followCamera={false}
                                infiniteGrid
                            />

                            <Stats />
                        </Suspense>
                    </Canvas>

                    {/* HUD Overlay */}
                    <div className="absolute bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                        <div className="flex items-center gap-4">
                            {timelineEnabled && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-primary-600/20 rounded-full border border-primary-500/30">
                                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                                    <span className="text-primary-300 text-xs font-semibold">4D ATIVO</span>
                                </div>
                            )}
                            <div>
                                <div className="text-gray-400 text-xs">Modelo</div>
                                <div className="font-mono text-xs truncate max-w-[120px]">
                                    {model ? model.name : 'Demo Building'}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-xs">Elementos</div>
                                <div className="font-mono">{model?.totalElements.toLocaleString() || '2,660'}</div>
                            </div>
                            {timelineEnabled && (
                                <div>
                                    <div className="text-gray-400 text-xs">Visíveis</div>
                                    <div className="font-mono text-green-400">
                                        {Array.from(animationStates.values()).filter(s => s.visible).length}
                                    </div>
                                </div>
                            )}
                            {selectedElement && (
                                <div>
                                    <div className="text-gray-400 text-xs">Selecionado</div>
                                    <div className="font-mono text-primary-400">#{selectedElement}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Properties Panel */}
                    {selectedElement && model && (
                        <PropertiesPanel
                            element={model.elements.find(el => el.id === selectedElement)!}
                            onClose={() => setSelectedElement(null)}
                        />
                    )}

                    {/* View controls */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button className="p-3 bg-gray-800/90 backdrop-blur-sm rounded-lg hover:bg-gray-700 transition text-white">
                            <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-gray-800/90 backdrop-blur-sm rounded-lg hover:bg-gray-700 transition text-white">
                            <EyeOff className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Timeline 4D */}
                    {timelineEnabled && (
                        <Timeline
                            activities={activities}
                            currentDate={currentDate}
                            onDateChange={setCurrentDate}
                            minDate={minDate}
                            maxDate={maxDate}
                        />
                    )}

                    {/* Tool Panels */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 max-w-xs">
                        {measurementToolsOpen && (
                            <MeasurementTools className="shadow-2xl" />
                        )}
                        {sectionPlaneOpen && (
                            <SectionPlane className="shadow-2xl" />
                        )}
                        {comparatorOpen && (
                            <ModelComparator
                                baseModel={model}
                                compareModel={null}
                                className="shadow-2xl"
                            />
                        )}
                        {issuesOpen && (
                            <IssuesRFI
                                issues={issues}
                                onCreateIssue={(newIssue) => {
                                    const issue: Issue = {
                                        ...newIssue,
                                        id: `issue_${Date.now()}`,
                                        createdAt: new Date(),
                                        updatedAt: new Date(),
                                        comments: []
                                    };
                                    setIssues(prev => [...prev, issue]);
                                }}
                                onUpdateIssue={(id, updates) => {
                                    setIssues(prev =>
                                        prev.map(issue =>
                                            issue.id === id
                                                ? { ...issue, ...updates, updatedAt: new Date() }
                                                : issue
                                        )
                                    );
                                }}
                                onDeleteIssue={(id) => {
                                    setIssues(prev => prev.filter(issue => issue.id !== id));
                                }}
                                onAddComment={(issueId, comment) => {
                                    setIssues(prev =>
                                        prev.map(issue =>
                                            issue.id === issueId
                                                ? {
                                                    ...issue,
                                                    comments: [
                                                        ...issue.comments,
                                                        {
                                                            ...comment,
                                                            id: `comment_${Date.now()}`,
                                                            createdAt: new Date()
                                                        }
                                                    ]
                                                }
                                                : issue
                                        )
                                    );
                                }}
                                onElementSelect={setSelectedElement}
                                className="shadow-2xl"
                            />
                        )}

                        {/* Clash Detection Panel */}
                        {clashDetectionOpen && model && (
                            <ClashDetection
                                elements={model.elements.map(el => {
                                    // Convert IfcElement to IFCElement
                                    const props: Record<string, string | number | boolean | null> = {};
                                    if (el.properties) {
                                        for (const [key, value] of Object.entries(el.properties)) {
                                            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
                                                props[key] = value;
                                            }
                                        }
                                    }
                                    return {
                                        expressID: el.id,
                                        type: el.type,
                                        ifcType: 0,
                                        guid: `${el.id}`,
                                        name: el.type,
                                        description: '',
                                        properties: props,
                                        geometry: {
                                            vertices: new Float32Array(),
                                            indices: new Uint32Array()
                                        }
                                    };
                                })}
                                onClashSelect={(clash: Clash) => {
                                    // Highlight clashing elements
                                    setHighlightedElements([clash.element1.id, clash.element2.id]);
                                    // Select first element
                                    setSelectedElement(clash.element1.id);
                                }}
                                onHighlightElements={setHighlightedElements}
                                className="shadow-2xl"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ElementNode({ name, count, level }: { name: string; count: number; level: number }) {
    const [expanded, setExpanded] = useState(false);
    const [visible, setVisible] = useState(true);

    return (
        <div style={{ marginLeft: `${level * 16}px` }}>
            <div className="flex items-center gap-2 py-1 px-2 hover:bg-gray-700 rounded cursor-pointer group">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-4 h-4 flex items-center justify-center text-gray-400"
                >
                    {expanded ? '▼' : '▶'}
                </button>
                <button
                    onClick={() => setVisible(!visible)}
                    className="w-4 h-4 text-gray-400 hover:text-white"
                >
                    {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <Layers className="w-4 h-4 text-primary-400" />
                <span className="text-white text-sm flex-1">{name}</span>
                <span className="text-gray-500 text-xs">{count}</span>
            </div>
        </div>
    );
}

function DemoBuilding() {
    return (
        <group>
            {/* Foundation */}
            <mesh position={[0, 0.5, 0]} receiveShadow castShadow>
                <boxGeometry args={[40, 1, 30]} />
                <meshStandardMaterial color="#808080" />
            </mesh>

            {/* Floors */}
            {Array.from({ length: 12 }).map((_, i) => (
                <group key={i} position={[0, 4 * i + 4, 0]}>
                    {/* Floor slab */}
                    <mesh receiveShadow castShadow>
                        <boxGeometry args={[40, 0.3, 30]} />
                        <meshStandardMaterial color="#cccccc" />
                    </mesh>

                    {/* Columns */}
                    {[-15, -5, 5, 15].map((x) =>
                        [-10, 0, 10].map((z) => (
                            <mesh key={`${x}-${z}`} position={[x, 2, z]} castShadow>
                                <boxGeometry args={[0.5, 4, 0.5]} />
                                <meshStandardMaterial color="#666666" />
                            </mesh>
                        ))
                    )}

                    {/* Walls */}
                    {i < 11 && (
                        <>
                            <mesh position={[0, 2, 15]} castShadow>
                                <boxGeometry args={[40, 4, 0.2]} />
                                <meshStandardMaterial color="#e0e0e0" transparent opacity={0.7} />
                            </mesh>
                            <mesh position={[0, 2, -15]} castShadow>
                                <boxGeometry args={[40, 4, 0.2]} />
                                <meshStandardMaterial color="#e0e0e0" transparent opacity={0.7} />
                            </mesh>
                        </>
                    )}
                </group>
            ))}

            {/* Roof */}
            <mesh position={[0, 48.5, 0]} receiveShadow castShadow>
                <boxGeometry args={[42, 0.5, 32]} />
                <meshStandardMaterial color="#8b4513" />
            </mesh>
        </group>
    );
}

function LoadingScreen() {
    return (
        <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#6366f1" />
        </mesh>
    );
}

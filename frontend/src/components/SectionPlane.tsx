import React, { useState, useCallback } from 'react';
import {
    Scissors,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    FlipVertical,
    Settings,
    X
} from 'lucide-react';
import { useSectionPlane, type SectionPlaneAxis, type SectionPlane as SectionPlaneType } from '@/hooks/useSectionPlane';

interface SectionPlaneProps {
    onPlanesChange?: (planes: SectionPlaneType[]) => void;
    className?: string;
}

export function SectionPlane({ onPlanesChange, className = '' }: SectionPlaneProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [newPlaneAxis, setNewPlaneAxis] = useState<SectionPlaneAxis>('X');

    const {
        planes,
        activePlane,
        showHelpers,
        createPlane,
        updatePlanePosition,
        togglePlane,
        invertPlane,
        deletePlane,
        clearPlanes,
        selectPlane,
        toggleHelpers,
    } = useSectionPlane();

    const handleCreatePlane = useCallback(() => {
        createPlane(newPlaneAxis, 0);
    }, [createPlane, newPlaneAxis]);

    const handleDeletePlane = useCallback((id: string) => {
        deletePlane(id);
    }, [deletePlane]);

    const handleClearAll = useCallback(() => {
        clearPlanes();
    }, [clearPlanes]);

    // Notify parent of plane changes
    React.useEffect(() => {
        onPlanesChange?.(planes);
    }, [planes, onPlanesChange]);

    return (
        <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Planos de Corte</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                        title="Configurações"
                    >
                        <Settings className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        {isExpanded ? (
                            <EyeOff className="w-4 h-4 text-gray-600" />
                        ) : (
                            <Eye className="w-4 h-4 text-gray-600" />
                        )}
                    </button>
                </div>
            </div>

            {/* Create Plane */}
            {isExpanded && (
                <div className="p-3 border-b bg-gray-50">
                    <div className="flex items-center gap-2">
                        <select
                            value={newPlaneAxis}
                            onChange={(e) => setNewPlaneAxis(e.target.value as SectionPlaneAxis)}
                            className="flex-1 px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="X">Plano X (YZ)</option>
                            <option value="Y">Plano Y (XZ)</option>
                            <option value="Z">Plano Z (XY)</option>
                            <option value="custom">Plano Customizado</option>
                        </select>
                        <button
                            onClick={handleCreatePlane}
                            className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                            title="Adicionar plano"
                        >
                            <Plus className="w-4 h-4" />
                            Adicionar
                        </button>
                    </div>
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
                <div className="border-b p-3 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-3">Configurações</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Mostrar Helpers</span>
                            <input
                                type="checkbox"
                                checked={showHelpers}
                                onChange={toggleHelpers}
                                className="rounded border-gray-300"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Planes List */}
            {planes.length > 0 && (
                <div className="border-t">
                    <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                        <h4 className="font-medium text-gray-900">
                            Planos Ativos ({planes.filter(p => p.enabled).length}/{planes.length})
                        </h4>
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            title="Remover todos os planos"
                        >
                            <Trash2 className="w-3 h-3" />
                            Limpar
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {planes.map((plane) => (
                            <div
                                key={plane.id}
                                className={`p-3 border-b hover:bg-gray-50 transition-colors ${plane.id === activePlane ? 'bg-purple-50' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm text-gray-900">
                                                {plane.name}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${plane.axis === 'X' ? 'bg-red-100 text-red-700' :
                                                plane.axis === 'Y' ? 'bg-green-100 text-green-700' :
                                                    plane.axis === 'Z' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {plane.axis}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => togglePlane(plane.id)}
                                            className={`p-1 rounded transition-colors ${plane.enabled
                                                ? 'hover:bg-green-100 text-green-600'
                                                : 'hover:bg-gray-200 text-gray-400'
                                                }`}
                                            title={plane.enabled ? 'Desativar plano' : 'Ativar plano'}
                                        >
                                            {plane.enabled ? (
                                                <Eye className="w-4 h-4" />
                                            ) : (
                                                <EyeOff className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => invertPlane(plane.id)}
                                            className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                                            title="Inverter direção do plano"
                                        >
                                            <FlipVertical className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => selectPlane(plane.id)}
                                            className={`p-1 rounded transition-colors ${plane.id === activePlane
                                                ? 'bg-purple-100 text-purple-600'
                                                : 'hover:bg-gray-100 text-gray-600'
                                                }`}
                                            title="Selecionar plano"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlane(plane.id)}
                                            className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                                            title="Excluir plano"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Position Slider */}
                                {plane.axis !== 'custom' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 w-16">Posição:</span>
                                        <input
                                            type="range"
                                            min="-50"
                                            max="50"
                                            step="0.1"
                                            value={plane.position}
                                            onChange={(e) => updatePlanePosition(plane.id, Number(e.target.value))}
                                            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            disabled={!plane.enabled}
                                        />
                                        <input
                                            type="number"
                                            value={plane.position.toFixed(2)}
                                            onChange={(e) => updatePlanePosition(plane.id, Number(e.target.value))}
                                            className="w-16 px-2 py-1 text-xs border rounded"
                                            step="0.1"
                                            disabled={!plane.enabled}
                                        />
                                    </div>
                                )}

                                {/* Status Indicators */}
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                    <span className={`px-2 py-0.5 rounded ${plane.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {plane.enabled ? 'Ativo' : 'Inativo'}
                                    </span>
                                    {plane.inverted && (
                                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                                            Invertido
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {planes.length === 0 && isExpanded && (
                <div className="p-6 text-center text-gray-500">
                    <Scissors className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Nenhum plano de corte ativo</p>
                    <p className="text-xs mt-1">Adicione um plano para visualizar seções do modelo</p>
                </div>
            )}

            {/* Instructions */}
            {planes.length > 0 && planes.some(p => p.enabled) && (
                <div className="border-t p-3 bg-purple-50">
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5" />
                        <div className="text-xs text-purple-900">
                            <p className="font-medium mb-1">Planos de corte ativos</p>
                            <p className="text-purple-700">
                                Use os controles deslizantes para ajustar a posição dos planos de corte.
                                Clique nos ícones para ativar/desativar ou inverter a direção.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

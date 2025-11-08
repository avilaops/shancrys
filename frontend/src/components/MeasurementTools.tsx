import React, { useState, useCallback } from 'react';
import {
    Ruler,
    Square,
    Triangle,
    Trash2,
    X,
    Settings,
    Eye,
    EyeOff
} from 'lucide-react';
import type { MeasurementType, Measurement } from '@/types/global';
import { useMeasurement } from '@/hooks/useMeasurement';
import { formatMeasurement } from '@/utils/measurementHelpers';
import { SHORTCUTS } from '@/utils/constants';

interface MeasurementToolsProps {
    onMeasurementChange?: (measurements: Measurement[]) => void;
    className?: string;
}

export function MeasurementTools({ onMeasurementChange, className = '' }: MeasurementToolsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Controlled settings state
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [snapToGeometry, setSnapToGeometry] = useState(false);
    const [gridSize, setGridSize] = useState(0.1);

    const {
        measurements,
        active,
        currentType,
        startMeasurement,
        stopMeasurement,
        clearMeasurements,
        deleteMeasurement,
        selectMeasurement,
        selectedMeasurement,
    } = useMeasurement({
        snapToGrid,
        gridSize,
        snapToGeometry,
        snapThreshold: 0.1,
    });
    const measurementTypes: Array<{
        type: MeasurementType;
        label: string;
        icon: React.ReactNode;
        description: string;
        shortcut: string;
    }> = [
            {
                type: 'distance',
                label: 'Distância',
                icon: <Ruler className="w-4 h-4" />,
                description: 'Medir distância entre dois pontos',
                shortcut: SHORTCUTS.GENERAL.SEARCH, // Placeholder
            },
            {
                type: 'area',
                label: 'Área',
                icon: <Square className="w-4 h-4" />,
                description: 'Calcular área de uma superfície',
                shortcut: SHORTCUTS.GENERAL.SEARCH, // Placeholder
            },
            {
                type: 'angle',
                label: 'Ângulo',
                icon: <Triangle className="w-4 h-4" />,
                description: 'Medir ângulo entre três pontos',
                shortcut: SHORTCUTS.GENERAL.SEARCH, // Placeholder
            },
        ];

    const handleStartMeasurement = useCallback((type: MeasurementType) => {
        if (active && currentType === type) {
            stopMeasurement();
        } else {
            startMeasurement(type);
        }
    }, [active, currentType, startMeasurement, stopMeasurement]);

    const handleDeleteMeasurement = useCallback((id: string) => {
        deleteMeasurement(id);
    }, [deleteMeasurement]);

    const handleClearAll = useCallback(() => {
        clearMeasurements();
    }, [clearMeasurements]);

    // Notify parent of measurement changes
    React.useEffect(() => {
        onMeasurementChange?.(measurements);
    }, [measurements, onMeasurementChange]);

    return (
        <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Ferramentas de Medição</h3>
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

            {/* Measurement Types */}
            <div className="p-3 space-y-2">
                {measurementTypes.map((type) => (
                    <button
                        key={type.type}
                        onClick={() => handleStartMeasurement(type.type)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${active && currentType === type.type
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                            }`}
                        title={`${type.description} (${type.shortcut})`}
                    >
                        <div className={`p-1 rounded ${active && currentType === type.type ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                            {type.icon}
                        </div>
                        <div className="flex-1 text-left">
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                        {active && currentType === type.type && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                    </button>
                ))}
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="border-t p-3 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-3">Configurações</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Snap to Grid</span>
                            <input
                                type="checkbox"
                                checked={snapToGrid}
                                onChange={e => setSnapToGrid(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Snap to Geometry</span>
                            <input
                                type="checkbox"
                                checked={snapToGeometry}
                                onChange={e => setSnapToGeometry(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Grid Size:</span>
                            <input
                                type="number"
                                value={gridSize}
                                onChange={e => setGridSize(Math.max(0.01, Math.min(1, Number(e.target.value))))}
                                step="0.01"
                                min="0.01"
                                max="1"
                                className="w-16 px-2 py-1 text-sm border rounded"
                            />
                            <span className="text-sm text-gray-500">m</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Measurements List */}
            {measurements.length > 0 && (
                <div className="border-t">
                    <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                        <h4 className="font-medium text-gray-900">
                            Medições ({measurements.length})
                        </h4>
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            title="Limpar todas as medições"
                        >
                            <Trash2 className="w-3 h-3" />
                            Limpar
                        </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {measurements.map((measurement) => (
                            <div
                                key={measurement.id}
                                className={`flex items-center justify-between p-3 border-b hover:bg-gray-50 cursor-pointer ${measurement.id === selectedMeasurement ? 'bg-blue-50' : ''
                                    }`}
                                onClick={() => selectMeasurement(measurement.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1 rounded ${measurement.type === 'distance' ? 'bg-blue-100' :
                                        measurement.type === 'area' ? 'bg-green-100' :
                                            'bg-purple-100'
                                        }`}>
                                        {measurement.type === 'distance' && <Ruler className="w-3 h-3" />}
                                        {measurement.type === 'area' && <Square className="w-3 h-3" />}
                                        {measurement.type === 'angle' && <Triangle className="w-3 h-3" />}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">
                                            {formatMeasurement(measurement.value, measurement.type, measurement.unit)}
                                        </div>
                                        <div className="text-xs text-gray-500 capitalize">
                                            {measurement.type}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteMeasurement(measurement.id);
                                    }}
                                    className="p-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                                    title="Excluir medição"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Instructions */}
            {active && (
                <div className="border-t p-3 bg-blue-50">
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse" />
                        <div>
                            <div className="font-medium text-blue-900">
                                {currentType === 'distance' && 'Clique em dois pontos para medir a distância'}
                                {currentType === 'area' && 'Clique em pelo menos 3 pontos para calcular a área'}
                                {currentType === 'angle' && 'Clique em três pontos (vértice, ponto 1, ponto 2)'}
                            </div>
                            <div className="text-sm text-blue-700 mt-1">
                                Pressione ESC para cancelar
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
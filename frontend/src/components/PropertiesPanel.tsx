import { X } from 'lucide-react';
import type { IfcElement } from '../hooks/useIfcLoader';

interface PropertiesPanelProps {
    element: IfcElement;
    onClose: () => void;
}

export default function PropertiesPanel({ element, onClose }: PropertiesPanelProps) {
    // Extract meaningful properties
    const properties = element.properties as Record<string, unknown> || {};

    return (
        <div className="absolute top-4 right-4 w-80 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-primary-600 px-4 py-3 flex items-center justify-between">
                <h3 className="text-white font-semibold">Propriedades do Elemento</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-primary-700 rounded transition"
                >
                    <X className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
                {/* Basic Info */}
                <div className="space-y-3">
                    <PropertyRow label="ID" value={element.id.toString()} />
                    <PropertyRow label="Tipo" value={element.type} />

                    {/* Geometry Info */}
                    <div className="pt-3 border-t border-gray-700">
                        <h4 className="text-gray-400 text-xs font-semibold mb-2">GEOMETRIA</h4>
                        <PropertyRow
                            label="Vértices"
                            value={element.geometry.attributes.position?.count?.toString() || 'N/A'}
                        />
                        <PropertyRow
                            label="Triângulos"
                            value={Math.floor((element.geometry.index?.count || 0) / 3).toLocaleString()}
                        />
                    </div>

                    {/* Material Info */}
                    <div className="pt-3 border-t border-gray-700">
                        <h4 className="text-gray-400 text-xs font-semibold mb-2">MATERIAL</h4>
                        <PropertyRow
                            label="Cor"
                            value={`#${(element.material as unknown as { color: { getHexString: () => string } }).color.getHexString()}`}
                        />
                    </div>

                    {/* IFC Properties */}
                    {Object.keys(properties).length > 0 && (
                        <div className="pt-3 border-t border-gray-700">
                            <h4 className="text-gray-400 text-xs font-semibold mb-2">PROPRIEDADES IFC</h4>
                            {Object.entries(properties).slice(0, 10).map(([key, value]) => (
                                <PropertyRow
                                    key={key}
                                    label={key}
                                    value={formatPropertyValue(value)}
                                />
                            ))}
                            {Object.keys(properties).length > 10 && (
                                <p className="text-xs text-gray-500 mt-2">
                                    +{Object.keys(properties).length - 10} propriedades adicionais
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface PropertyRowProps {
    label: string;
    value: string;
}

function PropertyRow({ label, value }: PropertyRowProps) {
    return (
        <div className="flex justify-between items-start gap-2 text-sm">
            <span className="text-gray-400 min-w-[100px]">{label}:</span>
            <span className="text-white font-mono text-right break-all">{value}</span>
        </div>
    );
}

function formatPropertyValue(value: unknown): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') return JSON.stringify(value).slice(0, 50) + '...';
    return String(value);
}

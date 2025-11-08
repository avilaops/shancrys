import React, { useState, useMemo } from 'react';
import {
    GitCompare,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronRight,
    Plus,
    Minus,
    AlertTriangle,
    Download
} from 'lucide-react';
import type { IFCProject, IFCElement } from '@/types/global';
import type { IfcModel } from '@/hooks/useIfcLoader';

interface ModelComparisonResult {
    added: IFCElement[];
    removed: IFCElement[];
    modified: IFCElement[];
    unchanged: IFCElement[];
}

interface ComparisonDiff {
    elementId: number;
    type: 'added' | 'removed' | 'modified';
    property?: string;
    oldValue?: unknown;
    newValue?: unknown;
}

interface ModelComparatorProps {
    baseModel: IFCProject | IfcModel | null;
    compareModel: IFCProject | IfcModel | null;
    onHighlightDifferences?: (diffs: ComparisonDiff[]) => void;
    className?: string;
}

export function ModelComparator({
    baseModel,
    compareModel,
    onHighlightDifferences,
    className = ''
}: ModelComparatorProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAdded, setShowAdded] = useState(true);
    const [showRemoved, setShowRemoved] = useState(true);
    const [showModified, setShowModified] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'summary' | 'details'>('summary');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Compare models
    const comparison = useMemo<ModelComparisonResult | null>(() => {
        if (!baseModel || !compareModel) return null;

        // Type guard to check if it's IFCProject
        const isIFCProject = (model: IFCProject | IfcModel): model is IFCProject => {
            return 'description' in model && 'spatialStructure' in model;
        };

        // Only compare if both are IFCProjects with full metadata
        if (!isIFCProject(baseModel) || !isIFCProject(compareModel)) {
            return null;
        }

        const baseMap = new Map(baseModel.elements.map(el => [el.guid, el]));
        const compareMap = new Map(compareModel.elements.map(el => [el.guid, el]));

        const added: IFCElement[] = [];
        const removed: IFCElement[] = [];
        const modified: IFCElement[] = [];
        const unchanged: IFCElement[] = [];

        // Find added and modified
        compareModel.elements.forEach(compareEl => {
            const baseEl = baseMap.get(compareEl.guid);
            if (!baseEl) {
                added.push(compareEl);
            } else {
                // Check for modifications
                const isModified = hasPropertyChanges(baseEl, compareEl);
                if (isModified) {
                    modified.push(compareEl);
                } else {
                    unchanged.push(compareEl);
                }
            }
        });

        // Find removed
        baseModel.elements.forEach(baseEl => {
            if (!compareMap.has(baseEl.guid)) {
                removed.push(baseEl);
            }
        });

        return { added, removed, modified, unchanged };
    }, [baseModel, compareModel]);

    // Generate diffs
    const diffs = useMemo<ComparisonDiff[]>(() => {
        if (!comparison) return [];

        const allDiffs: ComparisonDiff[] = [];

        comparison.added.forEach(el => {
            allDiffs.push({
                elementId: el.expressID,
                type: 'added'
            });
        });

        comparison.removed.forEach(el => {
            allDiffs.push({
                elementId: el.expressID,
                type: 'removed'
            });
        });

        comparison.modified.forEach(el => {
            allDiffs.push({
                elementId: el.expressID,
                type: 'modified'
            });
        });

        return allDiffs;
    }, [comparison]);

    // Notify parent of differences
    React.useEffect(() => {
        if (diffs.length > 0) {
            onHighlightDifferences?.(diffs);
        }
    }, [diffs, onHighlightDifferences]);

    // Group elements by type
    const groupedChanges = useMemo(() => {
        if (!comparison) return { added: {}, removed: {}, modified: {} };

        return {
            added: groupByType(comparison.added),
            removed: groupByType(comparison.removed),
            modified: groupByType(comparison.modified)
        };
    }, [comparison]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    const exportReport = () => {
        if (!comparison) return;

        const report = {
            timestamp: new Date().toISOString(),
            baseModel: baseModel?.name,
            compareModel: compareModel?.name,
            summary: {
                added: comparison.added.length,
                removed: comparison.removed.length,
                modified: comparison.modified.length,
                unchanged: comparison.unchanged.length
            },
            details: {
                added: comparison.added.map(el => ({
                    guid: el.guid,
                    type: el.type,
                    name: el.name
                })),
                removed: comparison.removed.map(el => ({
                    guid: el.guid,
                    type: el.type,
                    name: el.name
                })),
                modified: comparison.modified.map(el => ({
                    guid: el.guid,
                    type: el.type,
                    name: el.name
                }))
            }
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comparison-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!baseModel || !compareModel) {
        return (
            <div className={`bg-white rounded-lg shadow-lg border p-6 ${className}`}>
                <div className="text-center text-gray-500">
                    <GitCompare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-semibold">Comparador de Modelos</p>
                    <p className="text-sm mt-2">Carregue dois modelos IFC para comparar</p>
                </div>
            </div>
        );
    }

    if (!comparison) return null;

    return (
        <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Comparador de Modelos</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={exportReport}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                        title="Exportar Relatório"
                    >
                        <Download className="w-4 h-4 text-gray-600" />
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

            {/* Summary */}
            <div className="p-3 border-b bg-gray-50">
                <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-700">
                            {comparison.added.length}
                        </div>
                        <div className="text-xs text-green-600">Adicionados</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-700">
                            {comparison.removed.length}
                        </div>
                        <div className="text-xs text-red-600">Removidos</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-700">
                            {comparison.modified.length}
                        </div>
                        <div className="text-xs text-yellow-600">Modificados</div>
                    </div>
                    <div className="text-center p-2 bg-gray-100 rounded-lg border border-gray-300">
                        <div className="text-2xl font-bold text-gray-700">
                            {comparison.unchanged.length}
                        </div>
                        <div className="text-xs text-gray-600">Inalterados</div>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <>
                    {/* Tabs */}
                    <div className="flex border-b">
                        <button
                            onClick={() => setSelectedTab('summary')}
                            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${selectedTab === 'summary'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Resumo
                        </button>
                        <button
                            onClick={() => setSelectedTab('details')}
                            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${selectedTab === 'details'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Detalhes
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="p-3 border-b bg-gray-50 flex gap-2">
                        <button
                            onClick={() => setShowAdded(!showAdded)}
                            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${showAdded
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-600 border'
                                }`}
                        >
                            <Plus className="w-3 h-3" />
                            Adicionados
                        </button>
                        <button
                            onClick={() => setShowRemoved(!showRemoved)}
                            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${showRemoved
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-gray-600 border'
                                }`}
                        >
                            <Minus className="w-3 h-3" />
                            Removidos
                        </button>
                        <button
                            onClick={() => setShowModified(!showModified)}
                            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${showModified
                                ? 'bg-yellow-600 text-white'
                                : 'bg-white text-gray-600 border'
                                }`}
                        >
                            <AlertTriangle className="w-3 h-3" />
                            Modificados
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-96 overflow-y-auto">
                        {selectedTab === 'summary' ? (
                            <div className="p-3 space-y-2">
                                {showAdded && comparison.added.length > 0 && (
                                    <ChangeCategory
                                        title="Elementos Adicionados"
                                        count={comparison.added.length}
                                        color="green"
                                        icon={<Plus className="w-4 h-4" />}
                                        groups={groupedChanges.added}
                                        expanded={expandedCategories}
                                        onToggle={toggleCategory}
                                    />
                                )}
                                {showRemoved && comparison.removed.length > 0 && (
                                    <ChangeCategory
                                        title="Elementos Removidos"
                                        count={comparison.removed.length}
                                        color="red"
                                        icon={<Minus className="w-4 h-4" />}
                                        groups={groupedChanges.removed}
                                        expanded={expandedCategories}
                                        onToggle={toggleCategory}
                                    />
                                )}
                                {showModified && comparison.modified.length > 0 && (
                                    <ChangeCategory
                                        title="Elementos Modificados"
                                        count={comparison.modified.length}
                                        color="yellow"
                                        icon={<AlertTriangle className="w-4 h-4" />}
                                        groups={groupedChanges.modified}
                                        expanded={expandedCategories}
                                        onToggle={toggleCategory}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="p-3 space-y-2">
                                {/* Detailed view with property changes */}
                                {comparison.modified.map(el => (
                                    <ElementDetail key={el.guid} element={el} />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// Helper Components
interface ChangeCategoryProps {
    title: string;
    count: number;
    color: 'green' | 'red' | 'yellow';
    icon: React.ReactNode;
    groups: Record<string, IFCElement[]>;
    expanded: Set<string>;
    onToggle: (category: string) => void;
}

function ChangeCategory({ title, count, color, icon, groups, expanded, onToggle }: ChangeCategoryProps) {
    const colorClasses = {
        green: 'bg-green-50 border-green-200 text-green-700',
        red: 'bg-red-50 border-red-200 text-red-700',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700'
    };

    return (
        <div className={`border rounded-lg ${colorClasses[color]}`}>
            <div className="p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-medium text-sm">{title}</span>
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full">{count}</span>
                </div>
            </div>
            <div className="px-2 pb-2 space-y-1">
                {Object.entries(groups).map(([type, elements]) => {
                    const categoryKey = `${title}-${type}`;
                    const isExpanded = expanded.has(categoryKey);
                    return (
                        <div key={type} className="bg-white rounded border">
                            <button
                                onClick={() => onToggle(categoryKey)}
                                className="w-full px-2 py-1.5 flex items-center justify-between text-sm hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-1">
                                    {isExpanded ? (
                                        <ChevronDown className="w-3 h-3" />
                                    ) : (
                                        <ChevronRight className="w-3 h-3" />
                                    )}
                                    <span className="font-medium">{type}</span>
                                </div>
                                <span className="text-xs text-gray-500">{elements.length}</span>
                            </button>
                            {isExpanded && (
                                <div className="px-2 pb-2 space-y-1">
                                    {elements.map(el => (
                                        <div
                                            key={el.guid}
                                            className="px-2 py-1 text-xs bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                                        >
                                            {el.name || el.guid}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ElementDetail({ element }: { element: IFCElement }) {
    return (
        <div className="border rounded-lg p-2 bg-yellow-50 border-yellow-200">
            <div className="flex items-start justify-between">
                <div>
                    <div className="font-medium text-sm text-gray-900">{element.name}</div>
                    <div className="text-xs text-gray-600">{element.type}</div>
                </div>
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
        </div>
    );
}

// Helper functions
function hasPropertyChanges(el1: IFCElement, el2: IFCElement): boolean {
    // Simple comparison - can be extended
    return JSON.stringify(el1.properties) !== JSON.stringify(el2.properties) ||
        el1.name !== el2.name ||
        el1.description !== el2.description;
}

function groupByType(elements: IFCElement[]): Record<string, IFCElement[]> {
    return elements.reduce((acc, el) => {
        if (!acc[el.type]) {
            acc[el.type] = [];
        }
        acc[el.type].push(el);
        return acc;
    }, {} as Record<string, IFCElement[]>);
}

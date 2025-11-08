import { useState, useCallback, useMemo } from 'react';
import {
    AlertTriangle,
    Play,
    Download,
    Search,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronDown,
    ChevronRight,
    Loader2
} from 'lucide-react';
import type { IFCElement } from '@/types/global';
import {
    detectClashes,
    groupClashesBySeverity,
    downloadClashReport,
    type Clash,
    type ClashSeverity,
    type ClashDetectionOptions
} from '@/services/clashDetectionService';

interface ClashDetectionProps {
    elements: IFCElement[];
    onClashSelect?: (clash: Clash) => void;
    onHighlightElements?: (elementIds: number[]) => void;
    className?: string;
}

export function ClashDetection({
    elements,
    onClashSelect,
    onHighlightElements,
    className = ''
}: ClashDetectionProps) {
    const [clashes, setClashes] = useState<Clash[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [totalChecks, setTotalChecks] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState<ClashSeverity | 'all'>('all');
    const [filterResolved, setFilterResolved] = useState<boolean | 'all'>('all');
    const [selectedClash, setSelectedClash] = useState<Clash | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [options, setOptions] = useState<Partial<ClashDetectionOptions>>({
        tolerance: 1,
        checkHardClash: true,
        checkSoftClash: true,
        checkClearance: false,
        clearanceDistance: 50
    });

    // Run clash detection
    const runDetection = useCallback(async () => {
        setIsRunning(true);
        setProgress(0);
        setTotalChecks(0);

        try {
            const result = await detectClashes(elements, {
                ...options,
                onProgress: (current, total) => {
                    setProgress(current);
                    setTotalChecks(total);
                }
            });

            setClashes(result.clashes);
        } catch (error) {
            console.error('Clash detection failed:', error);
        } finally {
            setIsRunning(false);
        }
    }, [elements, options]);

    // Filter clashes
    const filteredClashes = useMemo(() => {
        return clashes.filter(clash => {
            const matchesSearch =
                clash.element1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                clash.element2.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                clash.id.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesSeverity = filterSeverity === 'all' || clash.severity === filterSeverity;
            const matchesResolved = filterResolved === 'all' || clash.resolved === filterResolved;

            return matchesSearch && matchesSeverity && matchesResolved;
        });
    }, [clashes, searchTerm, filterSeverity, filterResolved]);

    // Group clashes
    const clashGroups = useMemo(() => {
        return groupClashesBySeverity(filteredClashes);
    }, [filteredClashes]);

    // Statistics
    const stats = useMemo(() => {
        const total = filteredClashes.length;
        const critical = filteredClashes.filter(c => c.severity === 'critical').length;
        const major = filteredClashes.filter(c => c.severity === 'major').length;
        const minor = filteredClashes.filter(c => c.severity === 'minor').length;
        const warning = filteredClashes.filter(c => c.severity === 'warning').length;
        const resolved = filteredClashes.filter(c => c.resolved).length;

        return { total, critical, major, minor, warning, resolved };
    }, [filteredClashes]);

    // Handle clash selection
    const handleClashSelect = useCallback((clash: Clash) => {
        setSelectedClash(clash);
        onClashSelect?.(clash);
        onHighlightElements?.([clash.element1.id, clash.element2.id]);
    }, [onClashSelect, onHighlightElements]);

    // Toggle resolved status
    const toggleResolved = useCallback((clashId: string) => {
        setClashes(prev =>
            prev.map(clash =>
                clash.id === clashId
                    ? { ...clash, resolved: !clash.resolved }
                    : clash
            )
        );
    }, []);

    // Export report
    const handleExport = useCallback(() => {
        downloadClashReport(filteredClashes);
    }, [filteredClashes]);

    const getSeverityIcon = (severity: ClashSeverity) => {
        switch (severity) {
            case 'critical':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'major':
                return <AlertTriangle className="w-4 h-4 text-orange-600" />;
            case 'minor':
                return <AlertCircle className="w-4 h-4 text-yellow-600" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-blue-600" />;
        }
    };

    const getSeverityColor = (severity: ClashSeverity) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-50 border-red-200 text-red-700';
            case 'major':
                return 'bg-orange-50 border-orange-200 text-orange-700';
            case 'minor':
                return 'bg-yellow-50 border-yellow-200 text-yellow-700';
            case 'warning':
                return 'bg-blue-50 border-blue-200 text-blue-700';
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-gray-900">Clash Detection</h3>
                    {clashes.length > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            {stats.total} conflitos
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {clashes.length > 0 && (
                        <button
                            onClick={handleExport}
                            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                            title="Exportar Relatório"
                        >
                            <Download className="w-4 h-4 text-gray-600" />
                        </button>
                    )}
                </div>
            </div>

            {/* Configuration */}
            <div className="p-3 border-b bg-gray-50 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tolerância (mm)
                        </label>
                        <input
                            type="number"
                            value={options.tolerance}
                            onChange={(e) => setOptions({ ...options, tolerance: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 text-sm border rounded-md"
                            min="0.1"
                            step="0.1"
                            disabled={isRunning}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Clearance (mm)
                        </label>
                        <input
                            type="number"
                            value={options.clearanceDistance}
                            onChange={(e) => setOptions({ ...options, clearanceDistance: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 text-sm border rounded-md"
                            min="1"
                            disabled={isRunning}
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <label className="flex items-center gap-1 text-xs">
                        <input
                            type="checkbox"
                            checked={options.checkHardClash}
                            onChange={(e) => setOptions({ ...options, checkHardClash: e.target.checked })}
                            disabled={isRunning}
                        />
                        Hard Clash
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                        <input
                            type="checkbox"
                            checked={options.checkSoftClash}
                            onChange={(e) => setOptions({ ...options, checkSoftClash: e.target.checked })}
                            disabled={isRunning}
                        />
                        Soft Clash
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                        <input
                            type="checkbox"
                            checked={options.checkClearance}
                            onChange={(e) => setOptions({ ...options, checkClearance: e.target.checked })}
                            disabled={isRunning}
                        />
                        Clearance
                    </label>
                </div>

                <button
                    onClick={runDetection}
                    disabled={isRunning || elements.length === 0}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRunning ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analisando... {progress}/{totalChecks}
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Executar Detecção
                        </>
                    )}
                </button>
            </div>

            {/* Statistics */}
            {clashes.length > 0 && (
                <div className="p-3 border-b bg-gray-50">
                    <div className="grid grid-cols-5 gap-2">
                        <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                            <div className="text-lg font-bold text-red-700">{stats.critical}</div>
                            <div className="text-xs text-red-600">Crítico</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
                            <div className="text-lg font-bold text-orange-700">{stats.major}</div>
                            <div className="text-xs text-orange-600">Major</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                            <div className="text-lg font-bold text-yellow-700">{stats.minor}</div>
                            <div className="text-xs text-yellow-600">Minor</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="text-lg font-bold text-blue-700">{stats.warning}</div>
                            <div className="text-xs text-blue-600">Aviso</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                            <div className="text-lg font-bold text-green-700">{stats.resolved}</div>
                            <div className="text-xs text-green-600">Resolvido</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            {clashes.length > 0 && (
                <div className="p-3 border-b space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar conflitos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border rounded-md"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterSeverity}
                            onChange={(e) => setFilterSeverity(e.target.value as ClashSeverity | 'all')}
                            className="flex-1 px-2 py-1.5 text-sm border rounded-md"
                        >
                            <option value="all">Todas Severidades</option>
                            <option value="critical">Crítico</option>
                            <option value="major">Major</option>
                            <option value="minor">Minor</option>
                            <option value="warning">Aviso</option>
                        </select>
                        <select
                            value={filterResolved === 'all' ? 'all' : filterResolved.toString()}
                            onChange={(e) => setFilterResolved(
                                e.target.value === 'all' ? 'all' : e.target.value === 'true'
                            )}
                            className="flex-1 px-2 py-1.5 text-sm border rounded-md"
                        >
                            <option value="all">Todos Status</option>
                            <option value="false">Pendente</option>
                            <option value="true">Resolvido</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Clashes List */}
            <div className="max-h-96 overflow-y-auto">
                {filteredClashes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        {clashes.length === 0 ? (
                            <>
                                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Execute a detecção para encontrar conflitos</p>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                                <p className="text-sm">Nenhum conflito encontrado com os filtros atuais</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="p-3 space-y-2">
                        {Array.from(clashGroups.entries()).map(([severity, severityClashes]) => (
                            <div key={severity} className={`border rounded-lg ${getSeverityColor(severity)}`}>
                                <button
                                    onClick={() => {
                                        const key = `severity_${severity}`;
                                        setExpandedGroups(prev => {
                                            const next = new Set(prev);
                                            if (next.has(key)) {
                                                next.delete(key);
                                            } else {
                                                next.add(key);
                                            }
                                            return next;
                                        });
                                    }}
                                    className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium"
                                >
                                    <div className="flex items-center gap-2">
                                        {getSeverityIcon(severity)}
                                        <span className="capitalize">{severity}</span>
                                        <span className="text-xs bg-white px-2 py-0.5 rounded-full">
                                            {severityClashes.length}
                                        </span>
                                    </div>
                                    {expandedGroups.has(`severity_${severity}`) ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </button>

                                {expandedGroups.has(`severity_${severity}`) && (
                                    <div className="px-2 pb-2 space-y-1">
                                        {severityClashes.map(clash => (
                                            <div
                                                key={clash.id}
                                                className={`bg-white rounded border p-2 cursor-pointer hover:shadow-md transition-shadow ${selectedClash?.id === clash.id ? 'ring-2 ring-blue-500' : ''
                                                    }`}
                                                onClick={() => handleClashSelect(clash)}
                                            >
                                                <div className="flex items-start justify-between mb-1">
                                                    <div className="flex-1">
                                                        <div className="text-xs font-medium text-gray-900">
                                                            {clash.element1.name} ↔ {clash.element2.name}
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {clash.element1.type} × {clash.element2.type}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleResolved(clash.id);
                                                        }}
                                                        className={`p-1 rounded ${clash.resolved
                                                                ? 'text-green-600 bg-green-50'
                                                                : 'text-gray-400 hover:bg-gray-50'
                                                            }`}
                                                        title={clash.resolved ? 'Marcar como pendente' : 'Marcar como resolvido'}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span>Profundidade: {(clash.penetrationDepth * 1000).toFixed(1)}mm</span>
                                                    <span>Volume: {clash.volume.toFixed(3)}m³</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

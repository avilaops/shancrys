import { useState, useMemo, useCallback } from 'react';
import {
    Calculator,
    Download,
    Filter,
    Search,
    ChevronDown,
    ChevronRight,
    FileSpreadsheet,
    DollarSign,
    Package,
} from 'lucide-react';
import type { IFCProject } from '@/services/ifcParser';
import {
    extractQuantities,
    groupQuantities,
    generateSummary,
    exportToCSV,
    exportToExcel,
    type QuantityItem,
    type QuantificationGroup,
} from '@/services/quantificationService';

interface QuantificationPanelProps {
    ifcData: IFCProject | null;
    onItemSelect?: (item: QuantityItem) => void;
    className?: string;
}

export function QuantificationPanel({ ifcData, onItemSelect, className = '' }: QuantificationPanelProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [showPricing, setShowPricing] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    // Extract quantities from IFC data
    const quantities = useMemo(() => {
        if (!ifcData) return [];
        return extractQuantities(ifcData);
    }, [ifcData]);

    // Generate summary
    const summary = useMemo(() => {
        return generateSummary(quantities);
    }, [quantities]);

    // Filter quantities
    const filteredQuantities = useMemo(() => {
        return quantities.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.type.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
            const matchesType = filterType === 'all' || item.type === filterType;
            return matchesSearch && matchesCategory && matchesType;
        });
    }, [quantities, searchTerm, filterCategory, filterType]);

    // Get filtered groups
    const filteredGroups = useMemo(() => {
        return groupQuantities(filteredQuantities);
    }, [filteredQuantities]);

    // Get unique categories and types
    const categories = useMemo(() => {
        return Array.from(new Set(quantities.map(q => q.category)));
    }, [quantities]);

    const types = useMemo(() => {
        return Array.from(new Set(quantities.map(q => q.type)));
    }, [quantities]);

    // Toggle group expansion
    const toggleGroup = useCallback((category: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    }, []);

    // Expand all groups
    const expandAll = useCallback(() => {
        setExpandedGroups(new Set(categories));
    }, [categories]);

    // Collapse all groups
    const collapseAll = useCallback(() => {
        setExpandedGroups(new Set());
    }, []);

    // Handle item selection
    const handleItemSelect = useCallback((item: QuantityItem) => {
        setSelectedItem(item.id);
        onItemSelect?.(item);
    }, [onItemSelect]);

    // Export to CSV
    const handleExportCSV = useCallback(() => {
        const csv = exportToCSV(filteredQuantities);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quantificacao_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [filteredQuantities]);

    // Export to Excel
    const handleExportExcel = useCallback(() => {
        const tsv = exportToExcel(filteredQuantities);
        const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quantificacao_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    }, [filteredQuantities]);

    // Format number for display
    const formatNumber = (value: number | undefined, decimals: number = 2): string => {
        if (value === undefined) return '-';
        return value.toFixed(decimals);
    };

    if (!ifcData) {
        return (
            <div className={`bg-white rounded-lg shadow-lg border p-6 ${className}`}>
                <div className="text-center text-gray-500">
                    <Calculator className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Nenhum modelo IFC carregado</p>
                    <p className="text-xs mt-1">Carregue um arquivo IFC para visualizar as quantificações</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Quantificação e Takeoff</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowPricing(!showPricing)}
                        className={`p-1.5 rounded-md transition-colors ${showPricing ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        title="Mostrar/Ocultar preços"
                    >
                        <DollarSign className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                        title="Exportar para CSV"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                        title="Exportar para Excel"
                    >
                        <Download className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="p-3 border-b bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-gray-600">Total de Itens</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{summary.totalItems}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                            <Calculator className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-gray-600">Volume Total</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                            {formatNumber(summary.totalVolume)} m³
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center gap-2 mb-1">
                            <Calculator className="w-4 h-4 text-purple-600" />
                            <span className="text-xs text-gray-600">Área Total</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                            {formatNumber(summary.totalArea)} m²
                        </p>
                    </div>
                    {showPricing && (
                        <div className="bg-white p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-4 h-4 text-yellow-600" />
                                <span className="text-xs text-gray-600">Custo Total</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">
                                R$ {formatNumber(summary.totalCost)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters and Search */}
            <div className="p-3 border-b bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou tipo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="all">Todas as Categorias</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="all">Todos os Tipos</option>
                        {types.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={expandAll}
                        className="text-xs text-blue-600 hover:underline"
                    >
                        Expandir Todos
                    </button>
                    <span className="text-xs text-gray-400">|</span>
                    <button
                        onClick={collapseAll}
                        className="text-xs text-blue-600 hover:underline"
                    >
                        Colapsar Todos
                    </button>
                </div>
            </div>

            {/* Grouped Quantities List */}
            <div className="max-h-[500px] overflow-y-auto">
                {filteredGroups.map((group: QuantificationGroup) => (
                    <div key={group.category} className="border-b">
                        {/* Group Header */}
                        <button
                            onClick={() => toggleGroup(group.category)}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                {expandedGroups.has(group.category) ? (
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                )}
                                <span className="font-medium text-gray-900">{group.category}</span>
                                <span className="text-xs text-gray-500">({group.totalCount} itens)</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                {group.totalVolume && (
                                    <span>{formatNumber(group.totalVolume)} m³</span>
                                )}
                                {group.totalArea && (
                                    <span>{formatNumber(group.totalArea)} m²</span>
                                )}
                                {showPricing && group.totalCost && (
                                    <span className="font-medium">R$ {formatNumber(group.totalCost)}</span>
                                )}
                            </div>
                        </button>

                        {/* Group Items */}
                        {expandedGroups.has(group.category) && (
                            <div className="bg-gray-50">
                                {group.items.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleItemSelect(item)}
                                        className={`flex items-center justify-between p-3 pl-10 border-t hover:bg-gray-100 cursor-pointer transition-colors ${selectedItem === item.id ? 'bg-green-50' : ''
                                            }`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                                <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                                                    {item.type}
                                                </span>
                                                {item.material && (
                                                    <span className="text-xs text-gray-500">
                                                        {item.material}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                                {item.length && (
                                                    <span>L: {formatNumber(item.length)}m</span>
                                                )}
                                                {item.width && (
                                                    <span>W: {formatNumber(item.width)}m</span>
                                                )}
                                                {item.height && (
                                                    <span>H: {formatNumber(item.height)}m</span>
                                                )}
                                                {item.area && (
                                                    <span>Área: {formatNumber(item.area)}m²</span>
                                                )}
                                                {item.volume && (
                                                    <span>Vol: {formatNumber(item.volume)}m³</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">
                                                {item.count} {item.unit}
                                            </span>
                                            {showPricing && item.totalPrice && (
                                                <span className="text-sm font-medium text-green-600">
                                                    R$ {formatNumber(item.totalPrice)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredQuantities.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                    <Filter className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Nenhum item encontrado</p>
                    <p className="text-xs mt-1">Ajuste os filtros para ver mais resultados</p>
                </div>
            )}

            {/* Footer Info */}
            <div className="border-t p-3 bg-gray-50">
                <div className="flex items-start gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1" />
                    <div>
                        <p className="font-medium mb-1">Quantidades extraídas automaticamente do modelo IFC</p>
                        <p className="text-gray-500">
                            Mostrando {filteredQuantities.length} de {quantities.length} itens.
                            Clique em um item para visualizá-lo no modelo 3D.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

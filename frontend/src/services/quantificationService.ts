/**
 * Service for extracting and managing quantities from IFC models
 */

import type { IFCProject, IFCElement } from './ifcParser';

export interface QuantityItem {
    id: string;
    name: string;
    type: string;
    category: string;
    material?: string;
    phase?: string;

    // Geometric quantities
    length?: number;
    width?: number;
    height?: number;
    area?: number;
    volume?: number;
    perimeter?: number;

    // Unit quantities
    count: number;
    unit: string;

    // Cost data
    unitPrice?: number;
    totalPrice?: number;

    // Custom properties
    properties: Record<string, string | number | boolean | null>;
}

export interface QuantificationGroup {
    category: string;
    items: QuantityItem[];
    totalCount: number;
    totalVolume?: number;
    totalArea?: number;
    totalLength?: number;
    totalCost?: number;
}

export interface QuantificationSummary {
    groups: QuantificationGroup[];
    totalItems: number;
    totalVolume: number;
    totalArea: number;
    totalLength: number;
    totalCost: number;
    byType: Record<string, number>;
    byMaterial: Record<string, number>;
    byPhase: Record<string, number>;
}

/**
 * Extract quantities from parsed IFC data
 */
export function extractQuantities(ifcData: IFCProject): QuantityItem[] {
    const quantities: QuantityItem[] = [];

    ifcData.elements.forEach((element: IFCElement) => {
        // Calculate geometric quantities
        const geometry = element.geometry;
        let volume = 0;
        let area = 0;
        let length = 0;
        let width = 0;
        let height = 0;

        if (geometry && geometry.indices.length > 0) {
            // Approximate volume using bounding box
            const positions = geometry.vertices;
            let minX = Infinity, minY = Infinity, minZ = Infinity;
            let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

            for (let i = 0; i < positions.length; i += 3) {
                minX = Math.min(minX, positions[i]);
                minY = Math.min(minY, positions[i + 1]);
                minZ = Math.min(minZ, positions[i + 2]);
                maxX = Math.max(maxX, positions[i]);
                maxY = Math.max(maxY, positions[i + 1]);
                maxZ = Math.max(maxZ, positions[i + 2]);
            }

            length = maxX - minX;
            width = maxY - minY;
            height = maxZ - minZ;

            volume = length * width * height;

            // Approximate area (for walls, slabs, etc.)
            if (element.type === 'IFCWALL' || element.type === 'IFCWALLSTANDARDCASE') {
                area = length * height * 2 + width * height * 2;
            } else if (element.type === 'IFCSLAB') {
                area = length * width;
            } else if (element.type === 'IFCROOF' || element.type === 'IFCCOVERING') {
                area = length * width;
            }
        }

        // Extract material from properties
        const material = element.properties.Material ||
            element.properties.MaterialName ||
            element.properties.ObjectType;

        // Extract phase from properties
        const phase = element.properties.Phase ||
            element.properties.ConstructionPhase ||
            element.properties.Status;

        const item: QuantityItem = {
            id: element.expressID.toString(),
            name: element.name || element.type,
            type: element.type,
            category: getCategoryFromType(element.type),
            material: material as string | undefined,
            phase: phase as string | undefined,

            length: volume > 0 ? length : undefined,
            width: volume > 0 ? width : undefined,
            height: volume > 0 ? height : undefined,
            area: area > 0 ? area : undefined,
            volume: volume > 0 ? volume : undefined,

            count: 1,
            unit: getUnitFromType(element.type),

            properties: element.properties,
        };

        quantities.push(item);
    });

    return quantities;
}

/**
 * Group quantities by category
 */
export function groupQuantities(items: QuantityItem[]): QuantificationGroup[] {
    const groups = new Map<string, QuantityItem[]>();

    items.forEach(item => {
        const category = item.category;
        if (!groups.has(category)) {
            groups.set(category, []);
        }
        groups.get(category)!.push(item);
    });

    return Array.from(groups.entries()).map(([category, items]) => {
        const totalCount = items.length;
        const totalVolume = items.reduce((sum, item) => sum + (item.volume || 0), 0);
        const totalArea = items.reduce((sum, item) => sum + (item.area || 0), 0);
        const totalLength = items.reduce((sum, item) => sum + (item.length || 0), 0);
        const totalCost = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

        return {
            category,
            items,
            totalCount,
            totalVolume: totalVolume > 0 ? totalVolume : undefined,
            totalArea: totalArea > 0 ? totalArea : undefined,
            totalLength: totalLength > 0 ? totalLength : undefined,
            totalCost: totalCost > 0 ? totalCost : undefined,
        };
    });
}

/**
 * Generate quantification summary
 */
export function generateSummary(items: QuantityItem[]): QuantificationSummary {
    const groups = groupQuantities(items);

    const byType: Record<string, number> = {};
    const byMaterial: Record<string, number> = {};
    const byPhase: Record<string, number> = {};

    items.forEach(item => {
        byType[item.type] = (byType[item.type] || 0) + 1;

        if (item.material) {
            byMaterial[item.material] = (byMaterial[item.material] || 0) + 1;
        }

        if (item.phase) {
            byPhase[item.phase] = (byPhase[item.phase] || 0) + 1;
        }
    });

    return {
        groups,
        totalItems: items.length,
        totalVolume: items.reduce((sum, item) => sum + (item.volume || 0), 0),
        totalArea: items.reduce((sum, item) => sum + (item.area || 0), 0),
        totalLength: items.reduce((sum, item) => sum + (item.length || 0), 0),
        totalCost: items.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
        byType,
        byMaterial,
        byPhase,
    };
}

/**
 * Apply unit prices to quantity items
 */
export function applyPricing(
    items: QuantityItem[],
    priceTable: Record<string, number>
): QuantityItem[] {
    return items.map(item => {
        const unitPrice = priceTable[item.type] || priceTable[item.category] || 0;
        const totalPrice = unitPrice * item.count;

        return {
            ...item,
            unitPrice,
            totalPrice,
        };
    });
}

/**
 * Export quantities to CSV format
 */
export function exportToCSV(items: QuantityItem[]): string {
    const headers = [
        'ID',
        'Nome',
        'Tipo',
        'Categoria',
        'Material',
        'Fase',
        'Comprimento (m)',
        'Largura (m)',
        'Altura (m)',
        'Área (m²)',
        'Volume (m³)',
        'Quantidade',
        'Unidade',
        'Preço Unitário',
        'Preço Total',
    ];

    const rows = items.map(item => [
        item.id,
        item.name,
        item.type,
        item.category,
        item.material || '',
        item.phase || '',
        item.length?.toFixed(2) || '',
        item.width?.toFixed(2) || '',
        item.height?.toFixed(2) || '',
        item.area?.toFixed(2) || '',
        item.volume?.toFixed(2) || '',
        item.count.toString(),
        item.unit,
        item.unitPrice?.toFixed(2) || '',
        item.totalPrice?.toFixed(2) || '',
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Export quantities to Excel-compatible format (TSV)
 */
export function exportToExcel(items: QuantityItem[]): string {
    const headers = [
        'ID',
        'Nome',
        'Tipo',
        'Categoria',
        'Material',
        'Fase',
        'Comprimento (m)',
        'Largura (m)',
        'Altura (m)',
        'Área (m²)',
        'Volume (m³)',
        'Quantidade',
        'Unidade',
        'Preço Unitário',
        'Preço Total',
    ];

    const rows = items.map(item => [
        item.id,
        item.name,
        item.type,
        item.category,
        item.material || '',
        item.phase || '',
        item.length?.toFixed(2) || '',
        item.width?.toFixed(2) || '',
        item.height?.toFixed(2) || '',
        item.area?.toFixed(2) || '',
        item.volume?.toFixed(2) || '',
        item.count.toString(),
        item.unit,
        item.unitPrice?.toFixed(2) || '',
        item.totalPrice?.toFixed(2) || '',
    ]);

    return [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
}

/**
 * Helper function to get category from IFC type
 */
function getCategoryFromType(type: string): string {
    const categoryMap: Record<string, string> = {
        IFCWALL: 'Estrutural',
        IFCWALLSTANDARDCASE: 'Estrutural',
        IFCSLAB: 'Estrutural',
        IFCCOLUMN: 'Estrutural',
        IFCBEAM: 'Estrutural',
        IFCFOOTING: 'Fundação',
        IFCPILE: 'Fundação',
        IFCDOOR: 'Esquadrias',
        IFCWINDOW: 'Esquadrias',
        IFCSTAIR: 'Circulação',
        IFCRAILING: 'Circulação',
        IFCROOF: 'Cobertura',
        IFCFURNISHINGELEMENT: 'Mobiliário',
        IFCMEMBER: 'Complementar',
        IFCPLATE: 'Complementar',
        IFCCOVERING: 'Revestimento',
    };

    return categoryMap[type] || 'Outros';
}

/**
 * Helper function to get unit from IFC type
 */
function getUnitFromType(type: string): string {
    const unitMap: Record<string, string> = {
        IFCWALL: 'm²',
        IFCWALLSTANDARDCASE: 'm²',
        IFCSLAB: 'm²',
        IFCCOLUMN: 'un',
        IFCBEAM: 'm',
        IFCFOOTING: 'un',
        IFCPILE: 'un',
        IFCDOOR: 'un',
        IFCWINDOW: 'un',
        IFCSTAIR: 'un',
        IFCRAILING: 'm',
        IFCROOF: 'm²',
        IFCFURNISHINGELEMENT: 'un',
        IFCMEMBER: 'm',
        IFCPLATE: 'un',
        IFCCOVERING: 'm²',
    };

    return unitMap[type] || 'un';
}

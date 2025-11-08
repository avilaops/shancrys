import type { Activity } from '../components/Timeline';

export function generateMockActivities(): Activity[] {
    const now = new Date();
    const start = new Date(now);
    start.setMonth(start.getMonth() - 6); // Start 6 months ago

    return [
        {
            id: '1',
            name: 'Fundações',
            startDate: new Date(start),
            endDate: new Date(start.getTime() + 30 * 86400000), // 30 days
            elementIds: [], // Will be populated based on IFC elements
            color: '#8b4513',
        },
        {
            id: '2',
            name: 'Estrutura - Pilares',
            startDate: new Date(start.getTime() + 25 * 86400000),
            endDate: new Date(start.getTime() + 90 * 86400000),
            elementIds: [],
            color: '#808080',
        },
        {
            id: '3',
            name: 'Estrutura - Lajes',
            startDate: new Date(start.getTime() + 30 * 86400000),
            endDate: new Date(start.getTime() + 95 * 86400000),
            elementIds: [],
            color: '#999999',
        },
        {
            id: '4',
            name: 'Paredes e Vedações',
            startDate: new Date(start.getTime() + 60 * 86400000),
            endDate: new Date(start.getTime() + 150 * 86400000),
            elementIds: [],
            color: '#cccccc',
        },
        {
            id: '5',
            name: 'Esquadrias',
            startDate: new Date(start.getTime() + 100 * 86400000),
            endDate: new Date(start.getTime() + 160 * 86400000),
            elementIds: [],
            color: '#87ceeb',
        },
        {
            id: '6',
            name: 'Cobertura',
            startDate: new Date(start.getTime() + 140 * 86400000),
            endDate: new Date(start.getTime() + 170 * 86400000),
            elementIds: [],
            color: '#8b4513',
        },
        {
            id: '7',
            name: 'Instalações Elétricas',
            startDate: new Date(start.getTime() + 120 * 86400000),
            endDate: new Date(start.getTime() + 175 * 86400000),
            elementIds: [],
            color: '#ffd700',
        },
        {
            id: '8',
            name: 'Instalações Hidráulicas',
            startDate: new Date(start.getTime() + 120 * 86400000),
            endDate: new Date(start.getTime() + 175 * 86400000),
            elementIds: [],
            color: '#4169e1',
        },
        {
            id: '9',
            name: 'Acabamentos',
            startDate: new Date(start.getTime() + 160 * 86400000),
            endDate: new Date(start.getTime() + 180 * 86400000),
            elementIds: [],
            color: '#deb887',
        },
    ];
}

export function getTimelineDateRange(activities: Activity[]): {
    minDate: Date;
    maxDate: Date;
} {
    if (activities.length === 0) {
        const now = new Date();
        return {
            minDate: now,
            maxDate: new Date(now.getTime() + 180 * 86400000),
        };
    }

    const dates = activities.flatMap((a) => [a.startDate, a.endDate]);
    return {
        minDate: new Date(Math.min(...dates.map((d) => d.getTime()))),
        maxDate: new Date(Math.max(...dates.map((d) => d.getTime()))),
    };
}

// Map IFC element types to activities
export function assignElementsToActivities(
    activities: Activity[],
    elements: { id: number; type: string }[]
): Activity[] {
    const activityMap: Record<string, string[]> = {
        '1': ['IFCFOOTINGTYPE', 'IFCFOOTING', 'IFCPILE'], // Fundações
        '2': ['IFCCOLUMN'], // Pilares
        '3': ['IFCSLAB', 'IFCROOF'], // Lajes
        '4': ['IFCWALL', 'IFCWALLSTANDARDCASE'], // Paredes
        '5': ['IFCWINDOW', 'IFCDOOR'], // Esquadrias
        '6': ['IFCROOF', 'IFCROOFTYPE'], // Cobertura
        '7': ['IFCCABLECARRIERFITTING', 'IFCCABLESEGMENT'], // Elétrica
        '8': ['IFCPIPEFITTING', 'IFCPIPESEGMENT'], // Hidráulica
        '9': ['IFCFURNISHINGELEMENT', 'IFCBUILDINGELEMENTPROXY'], // Acabamentos
    };

    return activities.map((activity) => {
        const types = activityMap[activity.id] || [];
        const elementIds = elements
            .filter((el) => types.some((type) => el.type.includes(type)))
            .map((el) => el.id);

        return {
            ...activity,
            elementIds,
        };
    });
}

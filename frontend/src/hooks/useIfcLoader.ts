import { useState, useCallback } from 'react';
import * as THREE from 'three';
import { IfcAPI } from 'web-ifc';

export interface IfcElement {
    id: number;
    type: string;
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
    properties?: Record<string, unknown>;
}

export interface IfcModel {
    elements: IfcElement[];
    modelId: number;
    name: string;
    totalElements: number;
}

// Helper function to get IFC type name from type code
function getIfcTypeName(typeCode: number): string {
    const typeMap: Record<number, string> = {
        103090709: 'IFCWALL',
        3495092785: 'IFCWALLSTANDARDCASE',
        1095909175: 'IFCSLAB',
        2016517767: 'IFCROOF',
        843113511: 'IFCCOLUMN',
        753842376: 'IFCBEAM',
        3304561284: 'IFCWINDOW',
        395920057: 'IFCDOOR',
        331165859: 'IFCSTAIR',
        2262370178: 'IFCRAILING',
        263784265: 'IFCFURNISHINGELEMENT',
        1095924616: 'IFCBUILDINGELEMENTPROXY',
        3856911033: 'IFCSPACE',
    };

    return typeMap[typeCode] || `IFCTYPE_${typeCode}`;
}

// Helper function to assign colors based on IFC element type
function getColorByType(type: string): number {
    const colorMap: Record<string, number> = {
        IFCWALL: 0xcccccc,
        IFCWALLSTANDARDCASE: 0xcccccc,
        IFCSLAB: 0x999999,
        IFCROOF: 0x8b4513,
        IFCCOLUMN: 0x808080,
        IFCBEAM: 0x8b7355,
        IFCWINDOW: 0x87ceeb,
        IFCDOOR: 0x8b4513,
        IFCSTAIR: 0xa9a9a9,
        IFCRAILING: 0x696969,
        IFCFURNISHINGELEMENT: 0xdeb887,
        IFCBUILDINGELEMENTPROXY: 0xdda0dd,
        IFCSPACE: 0xf0f8ff,
    };

    return colorMap[type] || 0xaaaaaa;
}

export function useIfcLoader() {
    const [model, setModel] = useState<IfcModel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const loadIfc = useCallback(async (file: File) => {
        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            // Initialize IFC API
            const ifcApi = new IfcAPI();
            await ifcApi.Init();

            // Read file as array buffer
            const data = await file.arrayBuffer();
            const uint8Array = new Uint8Array(data);

            // Open IFC model
            const modelId = ifcApi.OpenModel(uint8Array);
            setProgress(20);

            // Get all lines (elements) in the model
            const allLines = ifcApi.GetAllLines(modelId);
            setProgress(40);

            const elements: IfcElement[] = [];
            const totalLines = allLines.size();

            // Process each element
            for (let i = 0; i < totalLines; i++) {
                const expressId = allLines.get(i);

                try {
                    // Get geometry
                    const geometry = ifcApi.GetGeometry(modelId, expressId);

                    if (geometry && geometry.GetVertexDataSize() > 0) {
                        const verts = ifcApi.GetVertexArray(
                            geometry.GetVertexData(),
                            geometry.GetVertexDataSize()
                        );
                        const indices = ifcApi.GetIndexArray(
                            geometry.GetIndexData(),
                            geometry.GetIndexDataSize()
                        );

                        // Create Three.js geometry
                        const bufferGeometry = new THREE.BufferGeometry();

                        const positions = new Float32Array(verts.length);
                        for (let j = 0; j < verts.length; j++) {
                            positions[j] = verts[j];
                        }

                        bufferGeometry.setAttribute(
                            'position',
                            new THREE.BufferAttribute(positions, 3)
                        );
                        bufferGeometry.setIndex(Array.from(indices));
                        bufferGeometry.computeVertexNormals();

                        // Get element type
                        const elementType = ifcApi.GetLineType(modelId, expressId);
                        const typeName = getIfcTypeName(elementType);

                        // Get properties
                        const properties = ifcApi.GetLine(modelId, expressId);

                        // Create material based on type
                        const material = new THREE.MeshStandardMaterial({
                            color: getColorByType(typeName),
                            side: THREE.DoubleSide,
                            metalness: 0.1,
                            roughness: 0.8,
                        });

                        elements.push({
                            id: expressId,
                            type: typeName,
                            geometry: bufferGeometry,
                            material,
                            properties,
                        });
                    }
                } catch (err) {
                    console.warn(`Failed to process element ${expressId}:`, err);
                }

                // Update progress
                if (i % 100 === 0) {
                    setProgress(40 + (i / totalLines) * 50);
                }
            }

            setProgress(95);

            // Close model
            ifcApi.CloseModel(modelId);

            setModel({
                elements,
                modelId,
                name: file.name,
                totalElements: elements.length,
            });

            setProgress(100);
            setLoading(false);

        } catch (err) {
            console.error('IFC loading error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load IFC file');
            setLoading(false);
        }
    }, []);

    const clearModel = useCallback(() => {
        setModel(null);
        setProgress(0);
        setError(null);
    }, []);

    return {
        model,
        loading,
        error,
        progress,
        loadIfc,
        clearModel,
    };
}

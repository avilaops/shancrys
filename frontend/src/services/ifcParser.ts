import * as WEBIFC from 'web-ifc';
import { ifcCache } from '../utils/ifcCache';

export interface IFCElement {
    expressID: number;
    type: string;
    ifcType: number;
    guid: string;
    name: string;
    description: string;
    properties: Record<string, string | number | boolean | null>;
    geometry?: {
        vertices: Float32Array;
        indices: Uint32Array;
        normals?: Float32Array;
    };
}

export interface IFCProject {
    name: string;
    description: string;
    elements: IFCElement[];
    spatialStructure: IFCSpatialNode[];
    materials: Map<number, string>;
    types: Map<number, string>;
}

export interface IFCSpatialNode {
    expressID: number;
    type: string;
    name: string;
    children: IFCSpatialNode[];
    elements: number[]; // Express IDs of elements in this spatial node
}

export class IFCParser {
    private ifcApi: WEBIFC.IfcAPI;
    private modelID: number = 0;

    constructor() {
        this.ifcApi = new WEBIFC.IfcAPI();
    }

    async initialize(): Promise<void> {
        await this.ifcApi.Init();
    }

    async parseFile(file: File): Promise<IFCProject> {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Open IFC model
        this.modelID = this.ifcApi.OpenModel(uint8Array);

        // Extract project information
        const project = await this.extractProject();
        const spatialStructure = await this.extractSpatialStructure();
        const elements = await this.extractElements();

        return {
            name: project.name,
            description: project.description,
            elements,
            spatialStructure,
            materials: new Map(),
            types: new Map(),
        };
    }

    private async extractProject(): Promise<{ name: string; description: string }> {
        try {
            const projects = this.ifcApi.GetLineIDsWithType(this.modelID, WEBIFC.IFCPROJECT);
            if (projects.size() === 0) {
                return { name: 'Unnamed Project', description: '' };
            }

            const projectID = projects.get(0);
            const projectProps = await this.ifcApi.GetLine(this.modelID, projectID);

            return {
                name: projectProps.Name?.value || 'Unnamed Project',
                description: projectProps.Description?.value || '',
            };
        } catch (error) {
            console.error('Error extracting project:', error);
            return { name: 'Error Loading Project', description: '' };
        }
    }

    private async extractSpatialStructure(): Promise<IFCSpatialNode[]> {
        const spatialTypes = [
            WEBIFC.IFCSITE,
            WEBIFC.IFCBUILDING,
            WEBIFC.IFCBUILDINGSTOREY,
            WEBIFC.IFCSPACE,
        ];

        const nodes: IFCSpatialNode[] = [];

        for (const spatialType of spatialTypes) {
            const ids = this.ifcApi.GetLineIDsWithType(this.modelID, spatialType);

            for (let i = 0; i < ids.size(); i++) {
                const id = ids.get(i);
                try {
                    const props = await this.ifcApi.GetLine(this.modelID, id);
                    const node: IFCSpatialNode = {
                        expressID: id,
                        type: this.getTypeName(spatialType),
                        name: props.Name?.value || 'Unnamed',
                        children: [],
                        elements: [],
                    };
                    nodes.push(node);
                } catch (error) {
                    console.error(`Error extracting spatial node ${id}:`, error);
                }
            }
        }

        return nodes;
    }

    private async extractElements(): Promise<IFCElement[]> {
        const elementTypes = [
            WEBIFC.IFCWALL,
            WEBIFC.IFCWALLSTANDARDCASE,
            WEBIFC.IFCSLAB,
            WEBIFC.IFCDOOR,
            WEBIFC.IFCWINDOW,
            WEBIFC.IFCCOLUMN,
            WEBIFC.IFCBEAM,
            WEBIFC.IFCSTAIR,
            WEBIFC.IFCRAILING,
            WEBIFC.IFCROOF,
            WEBIFC.IFCFURNISHINGELEMENT,
            WEBIFC.IFCMEMBER,
            WEBIFC.IFCPLATE,
            WEBIFC.IFCCOVERING,
            WEBIFC.IFCFOOTING,
            WEBIFC.IFCPILE,
        ];

        const elements: IFCElement[] = [];

        for (const elementType of elementTypes) {
            const ids = this.ifcApi.GetLineIDsWithType(this.modelID, elementType);

            for (let i = 0; i < ids.size(); i++) {
                const id = ids.get(i);
                try {
                    const element = await this.extractElement(id, elementType);
                    if (element) {
                        elements.push(element);
                    }
                } catch (error) {
                    console.error(`Error extracting element ${id}:`, error);
                }
            }
        }

        return elements;
    }

    private async extractElement(expressID: number, ifcType: number): Promise<IFCElement | null> {
        try {
            const props = await this.ifcApi.GetLine(this.modelID, expressID);

            const element: IFCElement = {
                expressID,
                type: this.getTypeName(ifcType),
                ifcType,
                guid: props.GlobalId?.value || '',
                name: props.Name?.value || 'Unnamed',
                description: props.Description?.value || '',
                properties: await this.extractProperties(expressID),
            };

            // Extract geometry
            try {
                const geometry = this.ifcApi.GetGeometry(this.modelID, expressID);
                if (geometry) {
                    element.geometry = {
                        vertices: this.ifcApi.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize()),
                        indices: this.ifcApi.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize()),
                    };
                }
            } catch {
                // Some elements might not have geometry
                console.warn(`No geometry for element ${expressID}`);
            }

            return element;
        } catch (error) {
            console.error(`Error extracting element ${expressID}:`, error);
            return null;
        }
    }

    private async extractProperties(expressID: number): Promise<Record<string, string | number | boolean | null>> {
        const properties: Record<string, string | number | boolean | null> = {};

        try {
            const propSets = await this.ifcApi.GetLine(this.modelID, expressID);

            if (propSets.IsDefinedBy) {
                for (const relDefines of propSets.IsDefinedBy) {
                    try {
                        const relProps = await this.ifcApi.GetLine(this.modelID, relDefines.value);

                        if (relProps.RelatingPropertyDefinition) {
                            const propSet = await this.ifcApi.GetLine(this.modelID, relProps.RelatingPropertyDefinition.value);

                            if (propSet.HasProperties) {
                                for (const prop of propSet.HasProperties) {
                                    try {
                                        const property = await this.ifcApi.GetLine(this.modelID, prop.value);
                                        const propName = property.Name?.value || 'Unknown';
                                        const propValue = property.NominalValue?.value || null;
                                        properties[propName] = propValue;
                                    } catch {
                                        // Skip invalid properties
                                    }
                                }
                            }
                        }
                    } catch {
                        // Skip invalid property sets
                    }
                }
            }
        } catch {
            console.warn(`Could not extract properties for ${expressID}`);
        }

        return properties;
    }

    private getTypeName(ifcType: number): string {
        const typeNames: Record<number, string> = {
            [WEBIFC.IFCWALL]: 'Wall',
            [WEBIFC.IFCWALLSTANDARDCASE]: 'Wall',
            [WEBIFC.IFCSLAB]: 'Slab',
            [WEBIFC.IFCDOOR]: 'Door',
            [WEBIFC.IFCWINDOW]: 'Window',
            [WEBIFC.IFCCOLUMN]: 'Column',
            [WEBIFC.IFCBEAM]: 'Beam',
            [WEBIFC.IFCSTAIR]: 'Stair',
            [WEBIFC.IFCRAILING]: 'Railing',
            [WEBIFC.IFCROOF]: 'Roof',
            [WEBIFC.IFCFURNISHINGELEMENT]: 'Furniture',
            [WEBIFC.IFCMEMBER]: 'Member',
            [WEBIFC.IFCPLATE]: 'Plate',
            [WEBIFC.IFCCOVERING]: 'Covering',
            [WEBIFC.IFCFOOTING]: 'Footing',
            [WEBIFC.IFCPILE]: 'Pile',
            [WEBIFC.IFCSITE]: 'Site',
            [WEBIFC.IFCBUILDING]: 'Building',
            [WEBIFC.IFCBUILDINGSTOREY]: 'Storey',
            [WEBIFC.IFCSPACE]: 'Space',
        };

        return typeNames[ifcType] || 'Unknown';
    }

    close(): void {
        if (this.modelID !== undefined) {
            this.ifcApi.CloseModel(this.modelID);
        }
    }
}

// Service singleton
let parserInstance: IFCParser | null = null;

export async function getIFCParser(): Promise<IFCParser> {
    if (!parserInstance) {
        parserInstance = new IFCParser();
        await parserInstance.initialize();
    }
    return parserInstance;
}

export async function parseIFCFile(file: File, useCache: boolean = true): Promise<IFCProject> {
    // Check cache first
    if (useCache) {
        const hasCache = await ifcCache.has(file);

        if (hasCache) {
            console.log('Loading IFC from cache...');
            const cached = await ifcCache.get(file);

            if (cached) {
                // Reconstruct Maps from cached arrays
                const materials = new Map(cached.data.materials);
                const types = new Map(cached.data.types);

                // Convert cached geometry arrays back to TypedArrays
                const elements: IFCElement[] = cached.data.elements.map(el => ({
                    ...el,
                    geometry: el.geometry ? {
                        vertices: new Float32Array(el.geometry.vertices),
                        indices: new Uint32Array(el.geometry.indices),
                        normals: el.geometry.normals ? new Float32Array(el.geometry.normals) : undefined,
                    } : undefined,
                }));

                return {
                    name: cached.data.projectName,
                    description: cached.data.projectDescription,
                    elements,
                    spatialStructure: cached.data.spatialStructure as IFCSpatialNode[],
                    materials,
                    types,
                };
            }
        }
    }

    // Parse file if not cached
    console.log('Parsing IFC file...');
    const parser = await getIFCParser();
    const project = await parser.parseFile(file);

    // Cache the result
    if (useCache) {
        try {
            // Convert TypedArrays to regular arrays for storage
            const elementsForCache = project.elements.map(el => ({
                ...el,
                geometry: el.geometry ? {
                    vertices: Array.from(el.geometry.vertices),
                    indices: Array.from(el.geometry.indices),
                    normals: el.geometry.normals ? Array.from(el.geometry.normals) : undefined,
                } : undefined,
            }));

            await ifcCache.set(file, {
                projectName: project.name,
                projectDescription: project.description,
                elements: elementsForCache as typeof elementsForCache,
                spatialStructure: project.spatialStructure as typeof project.spatialStructure,
                materials: Array.from(project.materials.entries()),
                types: Array.from(project.types.entries()),
            });
            console.log('IFC file cached successfully');
        } catch (error) {
            console.error('Error caching IFC file:', error);
            // Continue even if caching fails
        }
    }

    return project;
}

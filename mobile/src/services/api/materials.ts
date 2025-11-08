/**
 * Serviço de materiais
 * Gerencia catálogo de materiais de construção
 */
import apiClient from './client';
import type { Material, ApiResponse, PaginatedResponse } from '../../types';

interface MaterialFilters {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
}

class MaterialService {
    /**
     * Lista todos os materiais com filtros e paginação
     */
    async getMaterials(filters?: MaterialFilters): Promise<PaginatedResponse<Material>> {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<Material>>>(
            '/materials',
            { params: filters }
        );
        return response.data.data;
    }

    /**
     * Busca um material por ID
     */
    async getMaterialById(id: string): Promise<Material> {
        const response = await apiClient.get<ApiResponse<Material>>(`/materials/${id}`);
        return response.data.data;
    }

    /**
     * Cria um novo material
     */
    async createMaterial(data: Partial<Material>): Promise<Material> {
        const response = await apiClient.post<ApiResponse<Material>>('/materials', data);
        return response.data.data;
    }

    /**
     * Atualiza um material existente
     */
    async updateMaterial(id: string, data: Partial<Material>): Promise<Material> {
        const response = await apiClient.put<ApiResponse<Material>>(
            `/materials/${id}`,
            data
        );
        return response.data.data;
    }

    /**
     * Deleta um material
     */
    async deleteMaterial(id: string): Promise<void> {
        await apiClient.delete(`/materials/${id}`);
    }

    /**
     * Busca categorias de materiais
     */
    async getCategories(): Promise<string[]> {
        const response = await apiClient.get<ApiResponse<string[]>>('/materials/categories');
        return response.data.data;
    }

    /**
     * Atualiza estoque de um material
     */
    async updateStock(id: string, quantity: number): Promise<Material> {
        const response = await apiClient.patch<ApiResponse<Material>>(
            `/materials/${id}/stock`,
            { quantity }
        );
        return response.data.data;
    }

    /**
     * Upload de imagem do material
     */
    async uploadImage(id: string, file: FormData): Promise<string> {
        const response = await apiClient.post<ApiResponse<{ url: string }>>(
            `/materials/${id}/image`,
            file,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data.url;
    }
}

export default new MaterialService();

/**
 * Serviço de projetos
 * Gerencia operações CRUD de projetos BIM
 */
import apiClient from './client';
import type { Project, ApiResponse, PaginatedResponse } from '../../types';

interface ProjectFilters {
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

class ProjectService {
    /**
     * Lista todos os projetos com filtros e paginação
     */
    async getProjects(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<Project>>>(
            '/projects',
            { params: filters }
        );
        return response.data.data;
    }

    /**
     * Busca um projeto por ID
     */
    async getProjectById(id: string): Promise<Project> {
        const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
        return response.data.data;
    }

    /**
     * Cria um novo projeto
     */
    async createProject(data: Partial<Project>): Promise<Project> {
        const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
        return response.data.data;
    }

    /**
     * Atualiza um projeto existente
     */
    async updateProject(id: string, data: Partial<Project>): Promise<Project> {
        const response = await apiClient.put<ApiResponse<Project>>(
            `/projects/${id}`,
            data
        );
        return response.data.data;
    }

    /**
     * Deleta um projeto
     */
    async deleteProject(id: string): Promise<void> {
        await apiClient.delete(`/projects/${id}`);
    }

    /**
     * Busca projetos do usuário atual
     */
    async getMyProjects(): Promise<Project[]> {
        const response = await apiClient.get<ApiResponse<Project[]>>('/projects/my');
        return response.data.data;
    }

    /**
     * Atualiza o status de um projeto
     */
    async updateProjectStatus(
        id: string,
        status: Project['status']
    ): Promise<Project> {
        const response = await apiClient.patch<ApiResponse<Project>>(
            `/projects/${id}/status`,
            { status }
        );
        return response.data.data;
    }

    /**
     * Adiciona membros ao projeto
     */
    async addProjectMembers(id: string, userIds: string[]): Promise<void> {
        await apiClient.post(`/projects/${id}/members`, { userIds });
    }

    /**
     * Remove membros do projeto
     */
    async removeProjectMember(id: string, userId: string): Promise<void> {
        await apiClient.delete(`/projects/${id}/members/${userId}`);
    }

    /**
     * Upload de thumbnail do projeto
     */
    async uploadThumbnail(id: string, file: FormData): Promise<string> {
        const response = await apiClient.post<ApiResponse<{ url: string }>>(
            `/projects/${id}/thumbnail`,
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

export default new ProjectService();

/**
 * Store de projetos com Zustand
 * Gerencia estado global de projetos BIM
 */
import { create } from 'zustand';
import { projectService } from '../services/api';
import type { Project, PaginatedResponse } from '../types';

interface ProjectState {
    // Estado
    projects: Project[];
    currentProject: Project | null;
    isLoading: boolean;
    error: string | null;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        hasMore: boolean;
    };

    // Ações
    fetchProjects: (filters?: any) => Promise<void>;
    fetchProjectById: (id: string) => Promise<void>;
    createProject: (data: Partial<Project>) => Promise<Project>;
    updateProject: (id: string, data: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    setCurrentProject: (project: Project | null) => void;
    clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    // Estado inicial
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        hasMore: false,
    },

    // Buscar projetos
    fetchProjects: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const response = await projectService.getProjects(filters);
            set({
                projects: response.items,
                pagination: {
                    page: response.page,
                    pageSize: response.pageSize,
                    total: response.total,
                    hasMore: response.hasMore,
                },
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message || 'Erro ao buscar projetos',
                isLoading: false,
            });
        }
    },

    // Buscar projeto por ID
    fetchProjectById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const project = await projectService.getProjectById(id);
            set({
                currentProject: project,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message || 'Erro ao buscar projeto',
                isLoading: false,
            });
        }
    },

    // Criar projeto
    createProject: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const newProject = await projectService.createProject(data);
            set((state) => ({
                projects: [newProject, ...state.projects],
                isLoading: false,
            }));
            return newProject;
        } catch (error: any) {
            set({
                error: error.message || 'Erro ao criar projeto',
                isLoading: false,
            });
            throw error;
        }
    },

    // Atualizar projeto
    updateProject: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const updatedProject = await projectService.updateProject(id, data);
            set((state) => ({
                projects: state.projects.map((p) =>
                    p.id === id ? updatedProject : p
                ),
                currentProject:
                    state.currentProject?.id === id
                        ? updatedProject
                        : state.currentProject,
                isLoading: false,
            }));
        } catch (error: any) {
            set({
                error: error.message || 'Erro ao atualizar projeto',
                isLoading: false,
            });
            throw error;
        }
    },

    // Deletar projeto
    deleteProject: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await projectService.deleteProject(id);
            set((state) => ({
                projects: state.projects.filter((p) => p.id !== id),
                currentProject:
                    state.currentProject?.id === id ? null : state.currentProject,
                isLoading: false,
            }));
        } catch (error: any) {
            set({
                error: error.message || 'Erro ao deletar projeto',
                isLoading: false,
            });
            throw error;
        }
    },

    // Definir projeto atual
    setCurrentProject: (project) => set({ currentProject: project }),

    // Limpar erro
    clearError: () => set({ error: null }),
}));

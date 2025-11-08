/**
 * Store de materiais com Zustand
 * Gerencia estado global de materiais
 */
import { create } from 'zustand';
import { materialService } from '../services/api';
import type { Material, PaginatedResponse } from '../types';

interface MaterialState {
    // Estado
    materials: Material[];
    categories: string[];
    isLoading: boolean;
    error: string | null;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        hasMore: boolean;
    };

    // Ações
    fetchMaterials: (filters?: any) => Promise<void>;
    fetchCategories: () => Promise<void>;
    createMaterial: (data: Partial<Material>) => Promise<Material>;
    updateMaterial: (id: string, data: Partial<Material>) => Promise<void>;
    deleteMaterial: (id: string) => Promise<void>;
    updateStock: (id: string, quantity: number) => Promise<void>;
    clearError: () => void;
}

export const useMaterialStore = create<MaterialState>((set, get) => ({
    // Estado inicial
    materials: [],
    categories: [],
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        hasMore: false,
    },

    // Buscar materiais
    fetchMaterials: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const response = await materialService.getMaterials(filters);
            set({
                materials: response.items,
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
                error: error.message || 'Erro ao buscar materiais',
                isLoading: false,
            });
        }
    },

    // Buscar categorias
    fetchCategories: async () => {
        try {
            const categories = await materialService.getCategories();
            set({ categories });
        } catch (error: any) {
            console.error('Error fetching categories:', error);
        }
    },

    // Criar material
    createMaterial: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const newMaterial = await materialService.createMaterial(data);
            set((state) => ({
                materials: [newMaterial, ...state.materials],
                isLoading: false,
            }));
            return newMaterial;
        } catch (error: any) {
            set({
                error: error.message || 'Erro ao criar material',
                isLoading: false,
            });
            throw error;
        }
    },

    // Atualizar material
    updateMaterial: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const updatedMaterial = await materialService.updateMaterial(id, data);
            set((state) => ({
                materials: state.materials.map((m) =>
                    m.id === id ? updatedMaterial : m
                ),
                isLoading: false,
            }));
        } catch (error: any) {
            set({
                error: error.message || 'Erro ao atualizar material',
                isLoading: false,
            });
            throw error;
        }
    },

    // Deletar material
    deleteMaterial: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await materialService.deleteMaterial(id);
            set((state) => ({
                materials: state.materials.filter((m) => m.id !== id),
                isLoading: false,
            }));
        } catch (error: any) {
            set({
                error: error.message || 'Erro ao deletar material',
                isLoading: false,
            });
            throw error;
        }
    },

    // Atualizar estoque
    updateStock: async (id, quantity) => {
        try {
            const updatedMaterial = await materialService.updateStock(id, quantity);
            set((state) => ({
                materials: state.materials.map((m) =>
                    m.id === id ? updatedMaterial : m
                ),
            }));
        } catch (error: any) {
            set({
                error: error.message || 'Erro ao atualizar estoque',
            });
            throw error;
        }
    },

    // Limpar erro
    clearError: () => set({ error: null }),
}));

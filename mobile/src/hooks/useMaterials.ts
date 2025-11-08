/**
 * Hook customizado para materiais
 * Fornece interface para operações de materiais
 */
import { useEffect } from 'react';
import { useMaterialStore } from '../store/materialStore';

export function useMaterials(autoFetch = true) {
    const {
        materials,
        categories,
        isLoading,
        error,
        pagination,
        fetchMaterials,
        fetchCategories,
        createMaterial,
        updateMaterial,
        deleteMaterial,
        updateStock,
        clearError,
    } = useMaterialStore();

    // Busca materiais e categorias automaticamente
    useEffect(() => {
        if (autoFetch) {
            if (materials.length === 0) {
                fetchMaterials();
            }
            if (categories.length === 0) {
                fetchCategories();
            }
        }
    }, [autoFetch]);

    return {
        materials,
        categories,
        isLoading,
        error,
        pagination,
        fetchMaterials,
        fetchCategories,
        createMaterial,
        updateMaterial,
        deleteMaterial,
        updateStock,
        clearError,
    };
}

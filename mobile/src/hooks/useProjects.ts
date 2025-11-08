/**
 * Hook customizado para projetos
 * Fornece interface para operações de projetos
 */
import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';

export function useProjects(autoFetch = true) {
    const {
        projects,
        currentProject,
        isLoading,
        error,
        pagination,
        fetchProjects,
        fetchProjectById,
        createProject,
        updateProject,
        deleteProject,
        setCurrentProject,
        clearError,
    } = useProjectStore();

    // Busca projetos automaticamente se solicitado
    useEffect(() => {
        if (autoFetch && projects.length === 0) {
            fetchProjects();
        }
    }, [autoFetch]);

    return {
        projects,
        currentProject,
        isLoading,
        error,
        pagination,
        fetchProjects,
        fetchProjectById,
        createProject,
        updateProject,
        deleteProject,
        setCurrentProject,
        clearError,
    };
}

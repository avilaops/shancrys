/**
 * Tela de Lista de Projetos
 */
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useProjects } from '../../../src/hooks';
import { ProjectCard, Loading } from '../../../src/components';
import { THEME } from '../../../src/constants/config';
import type { Project } from '../../../src/types';

export default function ProjectsScreen() {
    const router = useRouter();
    const { projects, isLoading, fetchProjects } = useProjects();

    const handleProjectPress = (project: Project) => {
        // Navega para detalhes do projeto
        router.push(`/project/${project.id}`);
    };

    const handleRefresh = () => {
        fetchProjects();
    };

    if (isLoading && projects.length === 0) {
        return <Loading message="Carregando projetos..." />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Meus Projetos</Text>
                <Text style={styles.subtitle}>{projects.length} projetos ativos</Text>
            </View>

            <FlatList
                data={projects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ProjectCard project={item} onPress={handleProjectPress} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={handleRefresh}
                        tintColor={THEME.colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyText}>Nenhum projeto encontrado</Text>
                        <Text style={styles.emptySubtext}>
                            Crie seu primeiro projeto para começar
                        </Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/project/new')}
                activeOpacity={0.8}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    header: {
        padding: THEME.spacing.lg,
        backgroundColor: THEME.colors.primary,
        paddingTop: THEME.spacing.xl + 20, // Account for status bar
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: THEME.spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    listContent: {
        padding: THEME.spacing.md,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: THEME.spacing.xl * 3,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: THEME.spacing.md,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: THEME.colors.text,
        marginBottom: THEME.spacing.xs,
    },
    emptySubtext: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: THEME.spacing.lg,
        right: THEME.spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: THEME.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabIcon: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '300',
    },
});

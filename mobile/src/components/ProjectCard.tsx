/**
 * Componente de Card de Projeto
 * Exibe informações resumidas de um projeto
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { THEME } from '../../constants/config';
import type { Project } from '../../types';

interface ProjectCardProps {
    project: Project;
    onPress: (project: Project) => void;
}

export function ProjectCard({ project, onPress }: ProjectCardProps) {
    const getStatusColor = (status: Project['status']) => {
        switch (status) {
            case 'Planning':
                return '#f59e0b';
            case 'InProgress':
                return '#2563eb';
            case 'OnHold':
                return '#ef4444';
            case 'Completed':
                return '#22c55e';
            default:
                return THEME.colors.textSecondary;
        }
    };

    const getStatusText = (status: Project['status']) => {
        switch (status) {
            case 'Planning':
                return 'Planejamento';
            case 'InProgress':
                return 'Em Andamento';
            case 'OnHold':
                return 'Pausado';
            case 'Completed':
                return 'Concluído';
            default:
                return status;
        }
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(project)}
            activeOpacity={0.7}
        >
            {project.thumbnail ? (
                <Image
                    source={{ uri: project.thumbnail }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                    <Text style={styles.placeholderText}>📐</Text>
                </View>
            )}

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                    {project.name}
                </Text>

                <Text style={styles.description} numberOfLines={2}>
                    {project.description}
                </Text>

                <View style={styles.footer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(project.status)}</Text>
                    </View>

                    <Text style={styles.progress}>{project.progress}%</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.borderRadius.lg,
        marginBottom: THEME.spacing.md,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    thumbnail: {
        width: '100%',
        height: 150,
    },
    placeholderThumbnail: {
        backgroundColor: THEME.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        fontSize: 48,
    },
    content: {
        padding: THEME.spacing.md,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: THEME.colors.text,
        marginBottom: THEME.spacing.xs,
    },
    description: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
        marginBottom: THEME.spacing.md,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: THEME.spacing.sm,
        paddingVertical: THEME.spacing.xs,
        borderRadius: THEME.borderRadius.sm,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    progress: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME.colors.primary,
    },
});

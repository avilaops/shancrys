/**
 * Tela de Materiais
 */
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput } from 'react-native';
import { useState } from 'react';
import { useMaterials } from '../../../src/hooks';
import { Loading } from '../../../src/components';
import { THEME } from '../../../src/constants/config';
import type { Material } from '../../../src/types';

export default function MaterialsScreen() {
    const { materials, isLoading, fetchMaterials } = useMaterials();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMaterials = materials.filter((material) =>
        material.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRefresh = () => {
        fetchMaterials();
    };

    if (isLoading && materials.length === 0) {
        return <Loading message="Carregando materiais..." />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Catálogo de Materiais</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar materiais..."
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredMaterials}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MaterialCard material={item} />}
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
                        <Text style={styles.emptyIcon}>🧱</Text>
                        <Text style={styles.emptyText}>Nenhum material encontrado</Text>
                    </View>
                }
            />
        </View>
    );
}

// Componente de card de material
function MaterialCard({ material }: { material: Material }) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.materialName}>{material.name}</Text>
                <Text style={styles.materialCategory}>{material.category}</Text>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Preço:</Text>
                    <Text style={styles.priceValue}>
                        R$ {material.costPerUnit.toFixed(2)}/{material.unit}
                    </Text>
                </View>

                {material.supplier && (
                    <Text style={styles.supplier}>Fornecedor: {material.supplier}</Text>
                )}

                {material.stock !== undefined && (
                    <View style={[styles.stockBadge, material.stock > 0 ? styles.inStock : styles.outOfStock]}>
                        <Text style={styles.stockText}>
                            {material.stock > 0 ? `Em estoque: ${material.stock}` : 'Sem estoque'}
                        </Text>
                    </View>
                )}
            </View>
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
        paddingTop: THEME.spacing.xl + 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: THEME.spacing.md,
    },
    searchInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: THEME.borderRadius.md,
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.sm,
        fontSize: 16,
        color: '#fff',
    },
    listContent: {
        padding: THEME.spacing.md,
    },
    card: {
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.borderRadius.lg,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: THEME.spacing.sm,
    },
    materialName: {
        fontSize: 18,
        fontWeight: '600',
        color: THEME.colors.text,
        flex: 1,
    },
    materialCategory: {
        fontSize: 12,
        color: THEME.colors.textSecondary,
        backgroundColor: THEME.colors.border,
        paddingHorizontal: THEME.spacing.sm,
        paddingVertical: THEME.spacing.xs,
        borderRadius: THEME.borderRadius.sm,
    },
    cardBody: {
        gap: THEME.spacing.xs,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
    },
    priceValue: {
        fontSize: 18,
        fontWeight: '700',
        color: THEME.colors.primary,
    },
    supplier: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
    },
    stockBadge: {
        marginTop: THEME.spacing.xs,
        paddingHorizontal: THEME.spacing.sm,
        paddingVertical: THEME.spacing.xs,
        borderRadius: THEME.borderRadius.sm,
        alignSelf: 'flex-start',
    },
    inStock: {
        backgroundColor: '#dcfce7',
    },
    outOfStock: {
        backgroundColor: '#fee2e2',
    },
    stockText: {
        fontSize: 12,
        fontWeight: '600',
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
    },
});

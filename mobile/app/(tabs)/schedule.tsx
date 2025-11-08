/**
 * Tela de Cronograma
 */
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../../../src/constants/config';

export default function ScheduleScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Cronograma 4D</Text>
                <Text style={styles.subtitle}>Gestão de tarefas e prazos</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.comingSoon}>
                    <Text style={styles.comingSoonIcon}>🚧</Text>
                    <Text style={styles.comingSoonTitle}>Em Desenvolvimento</Text>
                    <Text style={styles.comingSoonText}>
                        A funcionalidade de cronograma 4D com Gantt Chart e gestão de tarefas está sendo desenvolvida.
                    </Text>

                    <View style={styles.featuresList}>
                        <Text style={styles.featuresTitle}>Recursos planejados:</Text>
                        <Text style={styles.featureItem}>📊 Gráfico de Gantt interativo</Text>
                        <Text style={styles.featureItem}>📅 Calendário de tarefas</Text>
                        <Text style={styles.featureItem}>👥 Atribuição de responsáveis</Text>
                        <Text style={styles.featureItem}>⏰ Notificações de prazos</Text>
                        <Text style={styles.featureItem}>📈 Visualização de progresso</Text>
                        <Text style={styles.featureItem}>🔗 Dependências entre tarefas</Text>
                    </View>
                </View>
            </ScrollView>
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
        marginBottom: THEME.spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    content: {
        padding: THEME.spacing.lg,
    },
    comingSoon: {
        alignItems: 'center',
        paddingTop: THEME.spacing.xl * 2,
    },
    comingSoonIcon: {
        fontSize: 80,
        marginBottom: THEME.spacing.lg,
    },
    comingSoonTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: THEME.spacing.md,
    },
    comingSoonText: {
        fontSize: 16,
        color: THEME.colors.textSecondary,
        textAlign: 'center',
        marginBottom: THEME.spacing.xl,
        lineHeight: 24,
    },
    featuresList: {
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.borderRadius.lg,
        padding: THEME.spacing.lg,
        width: '100%',
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: THEME.colors.text,
        marginBottom: THEME.spacing.md,
    },
    featureItem: {
        fontSize: 16,
        color: THEME.colors.text,
        marginBottom: THEME.spacing.sm,
        paddingLeft: THEME.spacing.md,
    },
});

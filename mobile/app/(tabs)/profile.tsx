/**
 * Tela de Perfil do Usuário
 */
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../src/hooks';
import { Button, Loading } from '../../../src/components';
import { THEME } from '../../../src/constants/config';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();

    const handleLogout = async () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    if (isLoading || !user) {
        return <Loading message="Carregando perfil..." />;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {user.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user.role}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informações</Text>

                {user.company && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Empresa:</Text>
                        <Text style={styles.infoValue}>{user.company}</Text>
                    </View>
                )}

                {user.phone && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Telefone:</Text>
                        <Text style={styles.infoValue}>{user.phone}</Text>
                    </View>
                )}

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Membro desde:</Text>
                    <Text style={styles.infoValue}>
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Configurações</Text>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>✏️ Editar Perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>🔔 Notificações</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>🔒 Privacidade</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>❓ Ajuda</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.logoutContainer}>
                <Button
                    title="Sair"
                    onPress={handleLogout}
                    variant="danger"
                />
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Shancrys BIM v1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    header: {
        alignItems: 'center',
        padding: THEME.spacing.xl,
        backgroundColor: THEME.colors.primary,
        paddingTop: THEME.spacing.xl + 20,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: THEME.spacing.md,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: THEME.spacing.xs,
    },
    email: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: THEME.spacing.md,
    },
    roleBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.xs,
        borderRadius: THEME.borderRadius.md,
    },
    roleText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    section: {
        padding: THEME.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.border,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: THEME.colors.text,
        marginBottom: THEME.spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: THEME.spacing.sm,
    },
    infoLabel: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
    },
    infoValue: {
        fontSize: 14,
        color: THEME.colors.text,
        fontWeight: '500',
    },
    menuItem: {
        paddingVertical: THEME.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.border,
    },
    menuText: {
        fontSize: 16,
        color: THEME.colors.text,
    },
    logoutContainer: {
        padding: THEME.spacing.lg,
    },
    footer: {
        alignItems: 'center',
        padding: THEME.spacing.lg,
    },
    footerText: {
        fontSize: 12,
        color: THEME.colors.textSecondary,
    },
});

/**
 * Tela inicial/splash
 * Verifica autenticação e redireciona
 */
import { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/hooks';
import { Loading } from '../src/components';
import { THEME } from '../src/constants/config';

export default function Index() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            // Redireciona baseado no estado de autenticação
            if (isAuthenticated) {
                router.replace('/(tabs)/projects');
            } else {
                router.replace('/(auth)/login');
            }
        }
    }, [isAuthenticated, isLoading]);

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>🏗️</Text>
            <Text style={styles.title}>Shancrys BIM</Text>
            <Loading message="Carregando..." />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.colors.primary,
    },
    logo: {
        fontSize: 80,
        marginBottom: THEME.spacing.md,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: THEME.spacing.xl,
    },
});

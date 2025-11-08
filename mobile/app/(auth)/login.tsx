/**
 * Tela de Login
 */
import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../src/hooks';
import { Input, Button } from '../../src/components';
import { THEME } from '../../src/constants/config';

export default function Login() {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        try {
            await login({ email, password });
            router.replace('/(tabs)/projects');
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Erro ao fazer login');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.logo}>🏗️</Text>
                    <Text style={styles.title}>Shancrys BIM</Text>
                    <Text style={styles.subtitle}>Plataforma de Gestão BIM</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="E-mail"
                        placeholder="seu@email.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Input
                        label="Senha"
                        placeholder="********"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <Button
                        title="Entrar"
                        onPress={handleLogin}
                        loading={isLoading}
                        style={styles.loginButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Não tem uma conta? </Text>
                        <Link href="/(auth)/register" asChild>
                            <Text style={styles.link}>Cadastre-se</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: THEME.spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: THEME.spacing.xl * 2,
    },
    logo: {
        fontSize: 64,
        marginBottom: THEME.spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: THEME.colors.text,
        marginBottom: THEME.spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: THEME.colors.textSecondary,
    },
    form: {
        width: '100%',
    },
    loginButton: {
        marginTop: THEME.spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: THEME.spacing.lg,
    },
    footerText: {
        color: THEME.colors.textSecondary,
    },
    link: {
        color: THEME.colors.primary,
        fontWeight: '600',
    },
});

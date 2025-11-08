/**
 * Tela de Registro
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

export default function Register() {
    const router = useRouter();
    const { register, isLoading } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
            return;
        }

        try {
            await register({
                name,
                email,
                password,
                role: 'Engineer', // Role padrão
            });
            router.replace('/(tabs)/projects');
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Erro ao criar conta');
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
                    <Text style={styles.title}>Criar Conta</Text>
                    <Text style={styles.subtitle}>Junte-se à Shancrys BIM</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Nome Completo"
                        placeholder="João Silva"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

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
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <Input
                        label="Confirmar Senha"
                        placeholder="Digite a senha novamente"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <Button
                        title="Criar Conta"
                        onPress={handleRegister}
                        loading={isLoading}
                        style={styles.registerButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Já tem uma conta? </Text>
                        <Link href="/(auth)/login" asChild>
                            <Text style={styles.link}>Entre aqui</Text>
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
        marginBottom: THEME.spacing.xl,
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
    registerButton: {
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

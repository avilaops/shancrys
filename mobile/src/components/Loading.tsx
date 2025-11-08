/**
 * Componente de Loading
 * Indicador de carregamento global
 */
import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { THEME } from '../constants/config';

interface LoadingProps {
    message?: string;
    size?: 'small' | 'large';
}

export function Loading({ message, size = 'large' }: LoadingProps) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={THEME.colors.primary} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.colors.background,
    },
    message: {
        marginTop: THEME.spacing.md,
        fontSize: 16,
        color: THEME.colors.textSecondary,
    },
});

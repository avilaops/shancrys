/**
 * Componente de Botão customizado
 * Botão reutilizável com variantes
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { THEME } from '../constants/config';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style,
}: ButtonProps) {
    const buttonStyles = [
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'outline' && styles.outlineButton,
        variant === 'danger' && styles.dangerButton,
        (disabled || loading) && styles.disabledButton,
        style,
    ];

    const textStyles = [
        styles.text,
        variant === 'outline' && styles.outlineText,
        (disabled || loading) && styles.disabledText,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: THEME.spacing.lg,
        paddingVertical: THEME.spacing.md,
        borderRadius: THEME.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    primaryButton: {
        backgroundColor: THEME.colors.primary,
    },
    secondaryButton: {
        backgroundColor: THEME.colors.secondary,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: THEME.colors.primary,
    },
    dangerButton: {
        backgroundColor: THEME.colors.error,
    },
    disabledButton: {
        backgroundColor: THEME.colors.border,
        opacity: 0.6,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    outlineText: {
        color: THEME.colors.primary,
    },
    disabledText: {
        color: THEME.colors.textSecondary,
    },
});

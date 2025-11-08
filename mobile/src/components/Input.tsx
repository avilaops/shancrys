/**
 * Componente de Input customizado
 * Input reutilizável com validação
 */
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { THEME } from '../constants/config';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
}

export function Input({ label, error, helperText, style, ...props }: InputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TextInput
                style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                    style,
                ]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholderTextColor={THEME.colors.textSecondary}
                {...props}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}
            {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: THEME.spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: THEME.colors.text,
        marginBottom: THEME.spacing.xs,
    },
    input: {
        backgroundColor: THEME.colors.surface,
        borderWidth: 1,
        borderColor: THEME.colors.border,
        borderRadius: THEME.borderRadius.md,
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.sm,
        fontSize: 16,
        color: THEME.colors.text,
        minHeight: 48,
    },
    inputFocused: {
        borderColor: THEME.colors.primary,
        borderWidth: 2,
    },
    inputError: {
        borderColor: THEME.colors.error,
    },
    errorText: {
        marginTop: THEME.spacing.xs,
        fontSize: 12,
        color: THEME.colors.error,
    },
    helperText: {
        marginTop: THEME.spacing.xs,
        fontSize: 12,
        color: THEME.colors.textSecondary,
    },
});

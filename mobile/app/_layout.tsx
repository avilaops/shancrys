/**
 * Layout raiz do app
 * Configura navegação e providers globais
 */
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
    const loadUser = useAuthStore((state) => state.loadUser);

    useEffect(() => {
        // Carrega usuário ao iniciar
        loadUser();
    }, []);

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#2563eb',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Shancrys BIM',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="(auth)"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
            />
        </Stack>
    );
}

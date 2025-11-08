/**
 * Layout de Tabs
 * Navegação principal do app
 */
import { Tabs } from 'expo-router';
import { THEME } from '../../src/constants/config';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: THEME.colors.primary,
                tabBarInactiveTintColor: THEME.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: THEME.colors.background,
                    borderTopColor: THEME.colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="projects"
                options={{
                    title: 'Projetos',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon icon="📐" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="materials"
                options={{
                    title: 'Materiais',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon icon="🧱" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="schedule"
                options={{
                    title: 'Cronograma',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon icon="📅" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon icon="👤" color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

// Componente simples de ícone de tab
function TabIcon({ icon, color }: { icon: string; color: string }) {
    return (
        <span style={{ fontSize: 24, color }}>{icon}</span>
    );
}

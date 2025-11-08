import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const login = async (email: string, _password: string) => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await fetch('/api/auth/login', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ email, password }),
            // });
            // const data = await response.json();

            // Mock successful login
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockUser: User = {
                id: '1',
                email,
                name: email.split('@')[0],
                tenantId: 'tenant-1',
                role: 'user',
            };

            const mockToken = 'mock-jwt-token-' + Date.now();

            setUser(mockUser);
            setToken(mockToken);
            localStorage.setItem('auth_token', mockToken);
            localStorage.setItem('auth_user', JSON.stringify(mockUser));
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Falha no login. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const register = async (name: string, email: string, _password: string) => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await fetch('/api/auth/register', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ name, email, password }),
            // });
            // const data = await response.json();

            // Mock successful registration
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mockUser: User = {
                id: '1',
                email,
                name,
                tenantId: 'tenant-1',
                role: 'user',
            };

            const mockToken = 'mock-jwt-token-' + Date.now();

            setUser(mockUser);
            setToken(mockToken);
            localStorage.setItem('auth_token', mockToken);
            localStorage.setItem('auth_user', JSON.stringify(mockUser));
        } catch (error) {
            console.error('Registration failed:', error);
            throw new Error('Falha no cadastro. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                register,
                logout,
                isAuthenticated: !!user,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

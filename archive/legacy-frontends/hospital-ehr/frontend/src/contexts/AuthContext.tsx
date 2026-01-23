'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User, LoginCredentials, RegisterData } from '@/services/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'ehr-token';
const USER_STORAGE_KEY = 'ehr-user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                // Invalid stored data, clear it
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                localStorage.removeItem(USER_STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.login(credentials);
            setToken(response.token);
            setUser(response.user);
            localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
        } catch (err: any) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterData) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.register(data);
            // After registration, auto-login
            await login({ email: data.email, password: data.password });
        } catch (err: any) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token && !!user,
                login,
                register,
                logout,
                error,
                clearError,
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

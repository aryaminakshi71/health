'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'ehr-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    // Get system preference
    const getSystemTheme = (): 'light' | 'dark' => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    };

    // Resolve the actual theme based on setting
    const resolveTheme = (themeValue: Theme): 'light' | 'dark' => {
        if (themeValue === 'system') {
            return getSystemTheme();
        }
        return themeValue;
    };

    // Apply theme to document
    const applyTheme = (resolved: 'light' | 'dark') => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolved);
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', resolved === 'dark' ? '#0f172a' : '#ffffff');
        }
    };

    // Initialize theme from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
        const initialTheme = stored || 'system';
        setThemeState(initialTheme);
        
        const resolved = resolveTheme(initialTheme);
        setResolvedTheme(resolved);
        applyTheme(resolved);
        
        setMounted(true);
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        if (!mounted) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = () => {
            if (theme === 'system') {
                const resolved = getSystemTheme();
                setResolvedTheme(resolved);
                applyTheme(resolved);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, mounted]);

    // Update theme
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        
        const resolved = resolveTheme(newTheme);
        setResolvedTheme(resolved);
        applyTheme(resolved);
    };

    // Toggle between light and dark
    const toggleTheme = () => {
        const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <ThemeContext.Provider value={{ theme: 'system', resolvedTheme: 'light', setTheme: () => {}, toggleTheme: () => {} }}>
                {children}
            </ThemeContext.Provider>
        );
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

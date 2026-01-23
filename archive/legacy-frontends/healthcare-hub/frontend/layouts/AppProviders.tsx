'use client'

import { ReactNode, createContext, useContext, useState, useEffect } from 'react'
import { ThemeProvider } from 'next-themes'

// Context for global app state
interface AppContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  user: Record<string, unknown> | null
  setUser: (user: Record<string, unknown> | null) => void
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  isOnline: boolean
  isMobile: boolean
  theme: string
  setTheme: (theme: string) => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  timestamp: Date
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within a Providers')
  }
  return context
}

interface ProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: ProvidersProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [theme, setTheme] = useState('light')

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Check mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, [])

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const addNotification = (notification: Notification) => {
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }
    setNotifications(prev => [...prev, newNotification])

    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, notification.duration)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const value: AppContextType = {
    isLoading,
    setIsLoading,
    user,
    setUser,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    isOnline,
    isMobile,
    theme,
    setTheme
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContext.Provider value={value}>
        {children}
      </AppContext.Provider>
    </ThemeProvider>
  )
}

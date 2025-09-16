// src/components/ThemeProvider.tsx - ENHANCED WITH PERFECT DARK MODE
import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'dark' | 'light' // The actual resolved theme (system resolves to dark or light)
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  actualTheme: 'light',
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'crisis-app-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    }
    return defaultTheme
  })

  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('light')

  // Function to get the actual theme (resolve system preference)
  const getActualTheme = (currentTheme: Theme): 'dark' | 'light' => {
    if (currentTheme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }
    return currentTheme
  }

  // Apply theme to document
  const applyTheme = (themeToApply: Theme) => {
    const root = window.document.documentElement
    const actualThemeValue = getActualTheme(themeToApply)
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark')
    
    // Add new theme class
    root.classList.add(actualThemeValue)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        actualThemeValue === 'dark' ? '#0a0a0a' : '#ffffff'
      )
    }
    
    // Update actual theme state
    setActualTheme(actualThemeValue)
  }

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (theme === 'system') {
        const newActualTheme = mediaQuery.matches ? 'dark' : 'light'
        setActualTheme(newActualTheme)
        applyTheme('system')
      }
    }

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleChange)
    
    // Initial application
    applyTheme(theme)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Update theme and persist to localStorage
  const updateTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  // Apply theme on mount and theme changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Add CSS custom properties for better theme integration
  useEffect(() => {
    const root = window.document.documentElement
    
    if (actualTheme === 'dark') {
      // Dark theme custom properties
      root.style.setProperty('--background', '0 0% 3.9%')
      root.style.setProperty('--foreground', '0 0% 98%')
      root.style.setProperty('--card', '0 0% 3.9%')
      root.style.setProperty('--card-foreground', '0 0% 98%')
      root.style.setProperty('--popover', '0 0% 3.9%')
      root.style.setProperty('--popover-foreground', '0 0% 98%')
      root.style.setProperty('--primary', '0 0% 98%')
      root.style.setProperty('--primary-foreground', '0 0% 9%')
      root.style.setProperty('--secondary', '0 0% 14.9%')
      root.style.setProperty('--secondary-foreground', '0 0% 98%')
      root.style.setProperty('--muted', '0 0% 14.9%')
      root.style.setProperty('--muted-foreground', '0 0% 63.9%')
      root.style.setProperty('--accent', '0 0% 14.9%')
      root.style.setProperty('--accent-foreground', '0 0% 98%')
      root.style.setProperty('--destructive', '0 62.8% 30.6%')
      root.style.setProperty('--destructive-foreground', '0 0% 98%')
      root.style.setProperty('--border', '0 0% 14.9%')
      root.style.setProperty('--input', '0 0% 14.9%')
      root.style.setProperty('--ring', '0 0% 83.1%')
      root.style.setProperty('--sidebar-background', '0 0% 3.9%')
      root.style.setProperty('--sidebar-foreground', '0 0% 98%')
      root.style.setProperty('--sidebar-border', '0 0% 14.9%')
      root.style.setProperty('--sidebar-accent', '0 0% 14.9%')
      root.style.setProperty('--sidebar-accent-foreground', '0 0% 98%')
    } else {
      // Light theme custom properties
      root.style.setProperty('--background', '0 0% 100%')
      root.style.setProperty('--foreground', '0 0% 3.9%')
      root.style.setProperty('--card', '0 0% 100%')
      root.style.setProperty('--card-foreground', '0 0% 3.9%')
      root.style.setProperty('--popover', '0 0% 100%')
      root.style.setProperty('--popover-foreground', '0 0% 3.9%')
      root.style.setProperty('--primary', '0 0% 9%')
      root.style.setProperty('--primary-foreground', '0 0% 98%')
      root.style.setProperty('--secondary', '0 0% 96.1%')
      root.style.setProperty('--secondary-foreground', '0 0% 9%')
      root.style.setProperty('--muted', '0 0% 96.1%')
      root.style.setProperty('--muted-foreground', '0 0% 45.1%')
      root.style.setProperty('--accent', '0 0% 96.1%')
      root.style.setProperty('--accent-foreground', '0 0% 9%')
      root.style.setProperty('--destructive', '0 84.2% 60.2%')
      root.style.setProperty('--destructive-foreground', '0 0% 98%')
      root.style.setProperty('--border', '0 0% 89.8%')
      root.style.setProperty('--input', '0 0% 89.8%')
      root.style.setProperty('--ring', '0 0% 3.9%')
      root.style.setProperty('--sidebar-background', '0 0% 98%')
      root.style.setProperty('--sidebar-foreground', '0 0% 3.9%')
      root.style.setProperty('--sidebar-border', '0 0% 89.8%')
      root.style.setProperty('--sidebar-accent', '0 0% 96.1%')
      root.style.setProperty('--sidebar-accent-foreground', '0 0% 9%')
    }
  }, [actualTheme])

  const value = {
    theme,
    setTheme: updateTheme,
    actualTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}

// Additional utility hook for theme-aware components
export const useThemeAware = () => {
  const { actualTheme } = useTheme()
  
  return {
    isDark: actualTheme === 'dark',
    isLight: actualTheme === 'light',
    actualTheme,
    // Utility functions for conditional styling
    themeClass: (lightClass: string, darkClass: string) => 
      actualTheme === 'dark' ? darkClass : lightClass,
    themeValue: function<T>(lightValue: T, darkValue: T): T {
      return actualTheme === 'dark' ? darkValue : lightValue;
    },
  }
}
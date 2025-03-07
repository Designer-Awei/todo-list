"use client"

import type React from "react"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEffect } from "react"

type ThemeState = {
  theme: "light" | "dark"
  accentColor: string
  setTheme: (theme: "light" | "dark") => void
  setAccentColor: (color: string) => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      accentColor: "blue",
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
    }),
    {
      name: "theme-storage",
    },
  ),
)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, accentColor } = useTheme()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      
      // 移除所有主题相关的类
      root.classList.remove("light", "dark")
      
      // 添加当前亮暗模式
      root.classList.add(theme)
      
      // 设置主题色
      root.setAttribute('data-theme', accentColor)
      
      // 调试信息
      console.log(`Theme updated:
        - Mode: ${theme}
        - Accent: ${accentColor}
        - Classes: ${root.className}
        - Data-theme: ${root.getAttribute('data-theme')}
      `)
    }
  }, [theme, accentColor])

  return children
}


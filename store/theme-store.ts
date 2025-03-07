"use client"

import type React from "react"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEffect } from "react"

type ThemeState = {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-storage",
    },
  ),
)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  return children
}


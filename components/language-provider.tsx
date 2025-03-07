"use client"

import { type ReactNode, createContext, useContext, useEffect, useState } from "react"
import { useLanguageStore } from "@/store/language-store"
import translations from "@/translations"
import { useToast } from "@/hooks/use-toast"

type LanguageContextType = {
  t: (key: string) => string
  currentLanguage: string
  changeLanguage: (language: string) => void
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage } = useLanguageStore()
  const [currentLanguage, setCurrentLanguage] = useState(language)
  const { toast } = useToast()

  useEffect(() => {
    setCurrentLanguage(language)
  }, [language])

  const t = (key: string) => {
    return translations[currentLanguage]?.[key] || key
  }

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage)
    const newT = (key: string) => translations[newLanguage]?.[key] || key
    toast({
      title: newT("languageChanged"),
    })
  }

  return <LanguageContext.Provider value={{ t, currentLanguage, changeLanguage }}>{children}</LanguageContext.Provider>
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider")
  }
  return context
}


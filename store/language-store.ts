import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useToast } from "@/hooks/use-toast"
import translations from "@/translations"

type LanguageState = {
  language: string
  setLanguage: (language: string) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "zh-CN",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "language-storage",
    },
  ),
)

export function useLanguageWithToast() {
  const { language, setLanguage } = useLanguageStore()
  const { toast } = useToast()

  const setLanguageWithToast = (newLanguage: string) => {
    setLanguage(newLanguage)
    const t = (key: string) => translations[newLanguage]?.[key] || key
    toast({
      title: t("languageChanged"),
    })
  }

  return { language, setLanguage: setLanguageWithToast }
}


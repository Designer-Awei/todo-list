"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Bell, BarChart2, Settings } from "lucide-react"
import { useTranslation } from "@/components/language-provider"

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()

  const isActive = (path: string) => pathname === path

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-2">
      <div className="container mx-auto max-w-md">
        <div className="flex justify-around">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            className="flex flex-col h-16 w-16"
            onClick={() => router.push("/")}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">{t("home")}</span>
          </Button>
          <Button
            variant={isActive("/reminders") ? "default" : "ghost"}
            className="flex flex-col h-16 w-16"
            onClick={() => router.push("/reminders")}
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs mt-1">{t("reminders")}</span>
          </Button>
          <Button
            variant={isActive("/statistics") ? "default" : "ghost"}
            className="flex flex-col h-16 w-16"
            onClick={() => router.push("/statistics")}
          >
            <BarChart2 className="h-5 w-5" />
            <span className="text-xs mt-1">{t("statistics")}</span>
          </Button>
          <Button
            variant={isActive("/settings") ? "default" : "ghost"}
            className="flex flex-col h-16 w-16"
            onClick={() => router.push("/settings")}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-1">{t("settings")}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}


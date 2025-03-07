import type { Metadata } from "next"
import Settings from "@/components/settings"
import NavBar from "@/components/nav-bar"

export const metadata: Metadata = {
  title: "设置 | Todo List App",
  description: "管理您的应用设置",
}

export default function SettingsPage() {
  return (
    <main className="min-h-screen">
      <Settings />
      <NavBar />
    </main>
  )
}


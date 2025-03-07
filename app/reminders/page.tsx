import type { Metadata } from "next"
import Reminders from "@/components/reminders"
import NavBar from "@/components/nav-bar"

export const metadata: Metadata = {
  title: "提醒 | Todo List App",
  description: "管理您的任务提醒",
}

export default function RemindersPage() {
  return (
    <main className="min-h-screen">
      <Reminders />
      <NavBar />
    </main>
  )
}


import type { Metadata } from "next"
import Statistics from "@/components/statistics"
import NavBar from "@/components/nav-bar"

export const metadata: Metadata = {
  title: "统计 | Todo List App",
  description: "查看您的任务完成情况统计",
}

export default function StatisticsPage() {
  return (
    <main className="min-h-screen">
      <Statistics />
      <NavBar />
    </main>
  )
}


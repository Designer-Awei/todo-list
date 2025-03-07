import type React from "react"
import type { Metadata } from "next"
// import { Inter } from "next/font/google"
import { ThemeProvider } from "@/store/theme-store"
import { LanguageProvider } from "@/components/language-provider"
import { Toaster } from "@/components/ui/toaster"
import "@/app/globals.css"

// 移除Google字体导入，使用系统字体
// const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Todo List App",
  description: "一款简洁高效的任务管理应用",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <div className="pb-20"></div> {/* 为底部导航条空出空间 */}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


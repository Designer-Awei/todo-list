"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Bell, Moon, Trash2, Download, Upload, HelpCircle, Info, User, Shield, Palette } from "lucide-react"
import { useTaskStore } from "@/store/task-store"
import { useTheme } from "@/store/theme-store"
import { useNotificationStore } from "@/store/notification-store"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/components/language-provider"

export default function Settings() {
  const router = useRouter()
  const { clearAllTasks, tasks, importTasks } = useTaskStore()
  const { theme, setTheme, accentColor, setAccentColor } = useTheme()
  const { isEnabled: notificationsEnabled, setIsEnabled: setNotificationsEnabled } = useNotificationStore()
  const { toast } = useToast()
  const { t, currentLanguage, changeLanguage } = useTranslation()

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [name, setName] = useState("用户")
  const [email, setEmail] = useState("")
  const [feedback, setFeedback] = useState("")

  // 导出任务数据
  const exportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `todo-list-backup-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // 导入任务数据
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedTasks = JSON.parse(content)
        importTasks(importedTasks)
        toast({
          title: t("importSuccess"),
        })
      } catch (error) {
        console.error("导入失败:", error)
        toast({
          title: t("importFailed"),
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  // 提交反馈
  const submitFeedback = () => {
    if (feedback.trim()) {
      toast({
        title: t("feedbackSuccess"),
      })
      setFeedback("")
    }
  }

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    changeLanguage(newLanguage)
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("settings")}</h1>
      </div>

      <div className="space-y-6">
        {/* 外观设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              {t("appearance")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Moon className="h-4 w-4" />
                <Label htmlFor="dark-mode">{t("darkMode")}</Label>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color">{t("themeColor")}</Label>
              <Select value={accentColor} onValueChange={(value) => {
                setAccentColor(value);
                console.log(`Selected accent color: ${value}`);
              }}>
                <SelectTrigger id="accent-color">
                  <SelectValue placeholder={t("themeColor")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">{t("blue")}</SelectItem>
                  <SelectItem value="purple">{t("purple")}</SelectItem>
                  <SelectItem value="green">{t("green")}</SelectItem>
                  <SelectItem value="orange">{t("orange")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{t("language")}</Label>
              <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language">
                  <SelectValue placeholder={t("language")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">简体中文</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                  <SelectItem value="ja-JP">日本語</SelectItem>
                  <SelectItem value="ko-KR">한국어</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              {t("notifications")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">{t("pushNotifications")}</Label>
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sounds">{t("sounds")}</Label>
              <Switch id="sounds" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* 账户设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              {t("account")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("username")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("enterYourName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("enterYourEmail")}
              />
            </div>
          </CardContent>
        </Card>

        {/* 数据管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              {t("dataManagement")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <Button variant="outline" className="w-[48%]" onClick={exportTasks}>
                <Download className="h-4 w-4 mr-2" />
                {t("exportData")}
              </Button>
              <div className="w-[48%]">
                <Input type="file" id="import-file" className="hidden" accept=".json" onChange={handleImport} />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("import-file")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t("importData")}
                </Button>
              </div>
            </div>

            <Separator />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("clearAllData")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("confirmClearData")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("clearDataWarning")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      clearAllTasks()
                      router.push("/")
                    }}
                  >
                    {t("confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* 反馈与帮助 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              {t("feedbackAndHelp")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">{t("feedback")}</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t("feedbackPlaceholder")}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={submitFeedback} disabled={!feedback.trim()}>
              {t("submitFeedback")}
            </Button>
          </CardFooter>
        </Card>

        {/* 关于 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              {t("about")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <h3 className="font-bold text-lg">Todo List</h3>
              <p className="text-sm text-muted-foreground">{t("version")} 1.0.0</p>
              <p className="text-sm mt-2">{t("appDescription")}</p>
              <div className="mt-4">
                <Button variant="link" className="text-sm p-0">
                  {t("privacyPolicy")}
                </Button>
                {" · "}
                <Button variant="link" className="text-sm p-0">
                  {t("termsOfService")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


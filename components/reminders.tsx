"use client"

import { useState } from "react"
import { format, isToday, isTomorrow, isThisWeek, isAfter } from "date-fns"
import { zhCN, enUS, ja, ko } from "date-fns/locale"
import { Bell, Calendar, Clock, Check, MoreVertical, Trash2, PencilLine, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTaskStore } from "@/store/task-store"
import { useNotificationStore } from "@/store/notification-store"
import type { Task } from "@/types/task"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/components/language-provider"

export default function Reminders() {
  const { tasks, updateTask, deleteTask, toggleTaskCompletion } = useTaskStore()
  const { isEnabled: notificationsEnabled, setIsEnabled: setNotificationsEnabled } = useNotificationStore()
  const [activeTab, setActiveTab] = useState("upcoming")
  const { toast } = useToast()
  const { t } = useTranslation()

  // 请求通知权限
  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await Notification.requestPermission()
        if (permission === "granted") {
          setNotificationsEnabled(true)
          toast({
            title: t("notificationEnabled"),
            description: t("refreshRequired"),
          })
        } else {
          setNotificationsEnabled(false)
          toast({
            title: t("notificationDisabled"),
            description: t("refreshRequired"),
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error)
        toast({
          title: t("notificationDisabled"),
          description: t("refreshRequired"),
          variant: "destructive",
        })
      }
    }
  }

  // 过滤有提醒的任务
  const tasksWithReminders = tasks.filter((task) => task.reminderDate)

  // 按时间分类任务
  const filterRemindersByTime = () => {
    const now = new Date()

    switch (activeTab) {
      case "today":
        return tasksWithReminders.filter((task) => task.reminderDate && isToday(task.reminderDate))
      case "tomorrow":
        return tasksWithReminders.filter((task) => task.reminderDate && isTomorrow(task.reminderDate))
      case "thisWeek":
        return tasksWithReminders.filter(
          (task) =>
            task.reminderDate &&
            isThisWeek(task.reminderDate) &&
            !isToday(task.reminderDate) &&
            !isTomorrow(task.reminderDate),
        )
      case "upcoming":
      default:
        return tasksWithReminders
          .filter((task) => task.reminderDate && isAfter(task.reminderDate, now))
          .sort((a, b) => {
            if (a.reminderDate && b.reminderDate) {
              return a.reminderDate.getTime() - b.reminderDate.getTime()
            }
            return 0
          })
    }
  }

  // 获取过期的提醒
  const overdueReminders = tasksWithReminders.filter(
    (task) => task.reminderDate && !task.completed && task.reminderDate < new Date(),
  )

  const filteredReminders = filterRemindersByTime()

  return (
    <div className="container mx-auto max-w-md p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("reminders")}</h1>
        <div className="flex items-center space-x-2">
          <Switch
            id="notifications"
            checked={notificationsEnabled}
            onCheckedChange={(checked) => {
              if (checked) {
                requestNotificationPermission()
              } else {
                setNotificationsEnabled(false)
                toast({
                  title: t("notificationDisabled"),
                  description: t("refreshRequired"),
                })
              }
            }}
          />
          <Label htmlFor="notifications">{t("notifications")}</Label>
        </div>
      </div>

      {overdueReminders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            {t("overdueReminders")}
          </h2>
          <div className="space-y-3">
            {overdueReminders.map((task) => (
              <ReminderCard
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskCompletion}
                onEdit={(task) => {
                  // 编辑任务的逻辑，可以跳转到主页面的编辑对话框
                  console.log("编辑任务", task.id)
                }}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="upcoming">{t("upcoming")}</TabsTrigger>
          <TabsTrigger value="today">{t("today")}</TabsTrigger>
          <TabsTrigger value="tomorrow">{t("tomorrow")}</TabsTrigger>
          <TabsTrigger value="thisWeek">{t("thisWeek")}</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {filteredReminders.length > 0 ? (
            filteredReminders.map((task) => (
              <ReminderCard
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskCompletion}
                onEdit={(task) => {
                  // 编辑任务的逻辑
                  console.log("编辑任务", task.id)
                }}
                onDelete={deleteTask}
              />
            ))
          ) : (
            <EmptyReminders message={t("noUpcomingReminders")} />
          )}
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          {filteredReminders.length > 0 ? (
            filteredReminders.map((task) => (
              <ReminderCard
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskCompletion}
                onEdit={(task) => {
                  console.log("编辑任务", task.id)
                }}
                onDelete={deleteTask}
              />
            ))
          ) : (
            <EmptyReminders message={t("noRemindersToday")} />
          )}
        </TabsContent>

        <TabsContent value="tomorrow" className="space-y-4">
          {filteredReminders.length > 0 ? (
            filteredReminders.map((task) => (
              <ReminderCard
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskCompletion}
                onEdit={(task) => {
                  console.log("编辑任务", task.id)
                }}
                onDelete={deleteTask}
              />
            ))
          ) : (
            <EmptyReminders message={t("noRemindersTomorrow")} />
          )}
        </TabsContent>

        <TabsContent value="thisWeek" className="space-y-4">
          {filteredReminders.length > 0 ? (
            filteredReminders.map((task) => (
              <ReminderCard
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskCompletion}
                onEdit={(task) => {
                  console.log("编辑任务", task.id)
                }}
                onDelete={deleteTask}
              />
            ))
          ) : (
            <EmptyReminders message={t("noRemindersThisWeek")} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReminderCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: {
  task: Task
  onToggleComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}) {
  const { t, currentLanguage } = useTranslation()
  const isOverdue = task.reminderDate && task.reminderDate < new Date() && !task.completed

  // 根据当前语言选择日期格式化的locale
  const getLocale = () => {
    switch (currentLanguage) {
      case "zh-CN":
        return zhCN
      case "ja-JP":
        return ja
      case "ko-KR":
        return ko
      default:
        return enUS
    }
  }

  return (
    <Card className={cn(task.completed ? "bg-muted" : "", isOverdue ? "border-red-300" : "")}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleComplete(task.id)}
              className={cn(
                "h-6 w-6 rounded-full border flex items-center justify-center",
                task.completed ? "bg-primary text-white" : "bg-white",
              )}
            >
              {task.completed && <Check className="h-4 w-4" />}
            </button>
            <div>
              <CardTitle className={cn("text-base", task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </CardTitle>
              {isOverdue && (
                <Badge variant="destructive" className="mt-1">
                  {t("overdue")}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">{t("openMenu")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <PencilLine className="mr-2 h-4 w-4" />
                {t("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      {task.description && (
        <CardContent className="p-4 pt-0 pb-2">
          <p className="text-sm text-muted-foreground">{task.description}</p>
        </CardContent>
      )}
      <CardFooter className="p-4 pt-0 text-xs flex items-center">
        <div className="flex items-center text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{task.reminderDate && format(task.reminderDate, "PPP", { locale: getLocale() })}</span>
        </div>
        <div className="flex items-center ml-3 text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{task.reminderDate && format(task.reminderDate, "HH:mm", { locale: getLocale() })}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

function EmptyReminders({ message }: { message?: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Bell className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-muted-foreground">{message || t("noReminders")}</h3>
      <p className="text-sm text-muted-foreground mt-1">{t("setReminderWhenCreatingTask")}</p>
    </div>
  )
}


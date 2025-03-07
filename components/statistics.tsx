"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart2, PieChart, Calendar, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useTaskStore } from "@/store/task-store"
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  differenceInDays,
  isBefore,
} from "date-fns"
import { useTranslation } from "@/components/language-provider"

export default function Statistics() {
  const { tasks } = useTaskStore()
  const [timeRange, setTimeRange] = useState("week")
  const [activeTab, setActiveTab] = useState("overview")
  const { t } = useTranslation()

  // 获取当前时间范围内的任务
  const getTasksInRange = () => {
    const now = new Date()
    let start: Date, end: Date

    if (timeRange === "week") {
      start = startOfWeek(now, { weekStartsOn: 1 }) // 从周一开始
      end = endOfWeek(now, { weekStartsOn: 1 })
    } else if (timeRange === "month") {
      start = startOfMonth(now)
      end = endOfMonth(now)
    } else {
      // all
      return tasks
    }

    return tasks.filter((task) => {
      const createdAt = new Date(task.createdAt)
      return isWithinInterval(createdAt, { start, end })
    })
  }

  const tasksInRange = getTasksInRange()
  const completedTasks = tasksInRange.filter((task) => task.completed)
  const pendingTasks = tasksInRange.filter((task) => !task.completed)
  const overdueTasks = tasksInRange.filter(
    (task) => !task.completed && task.dueDate && isBefore(task.dueDate, new Date()),
  )

  // 计算完成率
  const completionRate = tasksInRange.length > 0 ? Math.round((completedTasks.length / tasksInRange.length) * 100) : 0

  // 按类别统计任务
  const tasksByCategory = tasksInRange.reduce(
    (acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // 按优先级统计任务
  const tasksByPriority = tasksInRange.reduce(
    (acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // 计算平均完成时间（天）
  const calculateAverageCompletionTime = () => {
    const tasksWithCompletionTime = completedTasks.filter((task) => task.dueDate && task.createdAt)

    if (tasksWithCompletionTime.length === 0) return 0

    const totalDays = tasksWithCompletionTime.reduce((sum, task) => {
      const createdAt = new Date(task.createdAt)
      const completedAt = new Date() // 假设完成时间是当前时间，实际应该记录完成时间
      return sum + differenceInDays(completedAt, createdAt)
    }, 0)

    return Math.round(totalDays / tasksWithCompletionTime.length)
  }

  const averageCompletionTime = calculateAverageCompletionTime()

  // 获取类别名称
  const getCategoryName = (categoryId: string) => {
    return t(categoryId)
  }

  // 获取优先级名称
  const getPriorityName = (priority: string) => {
    return t(priority)
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("statistics")}</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t("timeRange")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{t("thisWeek")}</SelectItem>
            <SelectItem value="month">{t("thisMonth")}</SelectItem>
            <SelectItem value="all">{t("all")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="categories">{t("categories")}</TabsTrigger>
          <TabsTrigger value="priorities">{t("priorities")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard
              title={t("totalTasks")}
              value={tasksInRange.length.toString()}
              icon={<BarChart2 className="h-4 w-4 text-blue-500" />}
            />
            <StatCard
              title={t("completionRate")}
              value={`${completionRate}%`}
              icon={<PieChart className="h-4 w-4 text-green-500" />}
            />
            <StatCard
              title={t("completed")}
              value={completedTasks.length.toString()}
              icon={<CheckCircle className="h-4 w-4 text-green-500" />}
            />
            <StatCard
              title={t("pending")}
              value={pendingTasks.length.toString()}
              icon={<Clock className="h-4 w-4 text-yellow-500" />}
            />
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("taskStatus")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    {t("completed")}
                  </span>
                  <span className="text-sm font-medium">{completedTasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                    {t("pending")}
                  </span>
                  <span className="text-sm font-medium">{pendingTasks.length - overdueTasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    {t("overdue")}
                  </span>
                  <span className="text-sm font-medium">{overdueTasks.length}</span>
                </div>
              </div>

              {/* 简单的进度条可视化 */}
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                {tasksInRange.length > 0 && (
                  <>
                    <div
                      className="h-full bg-green-500 float-left"
                      style={{ width: `${(completedTasks.length / tasksInRange.length) * 100}%` }}
                    ></div>
                    <div
                      className="h-full bg-yellow-500 float-left"
                      style={{ width: `${((pendingTasks.length - overdueTasks.length) / tasksInRange.length) * 100}%` }}
                    ></div>
                    <div
                      className="h-full bg-red-500 float-left"
                      style={{ width: `${(overdueTasks.length / tasksInRange.length) * 100}%` }}
                    ></div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("efficiencyMetrics")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                    {t("averageCompletionTime")}
                  </span>
                  <span className="text-sm font-medium">{averageCompletionTime} {t("days")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    {t("overdueTasksRatio")}
                  </span>
                  <span className="text-sm font-medium">
                    {tasksInRange.length > 0
                      ? `${Math.round((overdueTasks.length / tasksInRange.length) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 text-purple-500 mr-2" />
                    {t("dailyAverageTasks")}
                  </span>
                  <span className="text-sm font-medium">
                    {timeRange === "week"
                      ? (tasksInRange.length / 7).toFixed(1)
                      : timeRange === "month"
                        ? (tasksInRange.length / 30).toFixed(1)
                        : (tasksInRange.length / 90).toFixed(1)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("statisticsByCategory")}</CardTitle>
              <CardDescription>{t("taskDistributionByCategory")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(tasksByCategory).map(([category, count]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{getCategoryName(category)}</span>
                      <span className="text-sm">{count} {t("tasks")}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          category === "personal"
                            ? "bg-blue-500"
                            : category === "work"
                              ? "bg-red-500"
                              : category === "study"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                        }`}
                        style={{ width: `${(count / tasksInRange.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 类别完成率 */}
              <div className="mt-8">
                <h3 className="text-sm font-medium mb-4">{t("categoryCompletionRate")}</h3>
                <div className="space-y-4">
                  {Object.entries(tasksByCategory).map(([category, _]) => {
                    const categoryTasks = tasksInRange.filter((task) => task.category === category)
                    const completedCategoryTasks = categoryTasks.filter((task) => task.completed)
                    const categoryCompletionRate =
                      categoryTasks.length > 0
                        ? Math.round((completedCategoryTasks.length / categoryTasks.length) * 100)
                        : 0

                    return (
                      <div key={`${category}-completion`} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{getCategoryName(category)}</span>
                          <span className="text-sm">{categoryCompletionRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${categoryCompletionRate}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priorities">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("statisticsByPriority")}</CardTitle>
              <CardDescription>{t("taskDistributionByPriority")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(tasksByPriority).map(([priority, count]) => (
                  <div key={priority} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{getPriorityName(priority)}</span>
                      <span className="text-sm">{count} {t("tasks")}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          priority === "high" ? "bg-red-500" : priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${(count / tasksInRange.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 优先级完成率 */}
              <div className="mt-8">
                <h3 className="text-sm font-medium mb-4">{t("priorityCompletionRate")}</h3>
                <div className="space-y-4">
                  {Object.entries(tasksByPriority).map(([priority, _]) => {
                    const priorityTasks = tasksInRange.filter((task) => task.priority === priority)
                    const completedPriorityTasks = priorityTasks.filter((task) => task.completed)
                    const priorityCompletionRate =
                      priorityTasks.length > 0
                        ? Math.round((completedPriorityTasks.length / priorityTasks.length) * 100)
                        : 0

                    return (
                      <div key={`${priority}-completion`} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{getPriorityName(priority)}</span>
                          <span className="text-sm">{priorityCompletionRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${priorityCompletionRate}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="rounded-full p-2 bg-muted">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}


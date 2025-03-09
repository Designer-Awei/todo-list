"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  CalendarIcon,
  Plus,
  Check,
  MoreVertical,
  Trash2,
  PencilLine,
  Bell,
  User,
  Briefcase,
  GraduationCap,
  Heart,
  Search,
} from "lucide-react"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Task, Category } from "@/types/task"
import { useTaskStore } from "@/store/task-store"
import { useTranslation } from "@/components/language-provider"
import { zhCN, enUS, ja, ko } from "date-fns/locale"

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = useTaskStore()
  const { t, currentLanguage } = useTranslation()

  const [activeTab, setActiveTab] = useState("all")
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [editTaskId, setEditTaskId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [newTask, setNewTask] = useState<Omit<Task, "id" | "completed" | "createdAt">>({
    title: "",
    description: "",
    category: "personal",
    priority: "medium",
    dueDate: undefined,
    reminderDate: undefined,
  })

  const categories: Category[] = [
    { id: "personal", name: "个人", color: "bg-blue-500", icon: <User className="h-4 w-4" /> },
    { id: "work", name: "工作", color: "bg-red-500", icon: <Briefcase className="h-4 w-4" /> },
    { id: "study", name: "学习", color: "bg-yellow-500", icon: <GraduationCap className="h-4 w-4" /> },
    { id: "health", name: "健康", color: "bg-green-500", icon: <Heart className="h-4 w-4" /> },
  ]

  const handleAddTask = () => {
    if (!newTask.title.trim()) return

    if (editTaskId) {
      // 编辑现有任务
      updateTask(editTaskId, newTask)
      setEditTaskId(null)
    } else {
      // 添加新任务
      addTask(newTask)
    }

    // 重置表单
    setNewTask({
      title: "",
      description: "",
      category: "personal",
      priority: "medium",
      dueDate: undefined,
      reminderDate: undefined,
    })
    setNewTaskOpen(false)
  }

  const handleEditTask = (task: Task) => {
    setEditTaskId(task.id)
    setNewTask({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      reminderDate: task.reminderDate,
    })
    setNewTaskOpen(true)
  }

  const filterTasks = () => {
    let filtered = [...tasks]

    // 按搜索查询筛选
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (task) => task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query),
      )
    }

    // 按选项卡筛选
    if (activeTab === "todo") {
      filtered = filtered.filter((task) => !task.completed)
    } else if (activeTab === "done") {
      filtered = filtered.filter((task) => task.completed)
    }

    // 按类别筛选
    if (activeCategory) {
      filtered = filtered.filter((task) => task.category === activeCategory)
    }

    return filtered
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

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
    <div className="container mx-auto max-w-md p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("tasks")}</h1>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)} className="h-9 w-9">
            <Search className="h-5 w-5" />
          </Button>
          <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="h-9 w-9">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editTaskId ? t("editTask") : t("addTask")}</DialogTitle>
                <DialogDescription>{t("enterTaskDetails")}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">{t("taskTitle")}</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder={t("taskTitle")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("taskDescription")}</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder={t("taskDescription")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">{t("category")}</Label>
                    <Select
                      value={newTask.category}
                      onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("category")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center">
                              <span className={`h-2 w-2 rounded-full ${category.color} mr-2`}></span>
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">{t("priority")}</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("priority")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">{t("high")}</SelectItem>
                        <SelectItem value="medium">{t("medium")}</SelectItem>
                        <SelectItem value="low">{t("low")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">{t("dueDate")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !newTask.dueDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTask.dueDate ? format(newTask.dueDate, "PPP", { locale: getLocale() }) : <span>{t("dueDate")}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newTask.dueDate}
                        onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                        initialFocus
                        locale={getLocale()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reminderDate">{t("reminders")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !newTask.reminderDate && "text-muted-foreground",
                        )}
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        {newTask.reminderDate ? (
                          format(newTask.reminderDate, "PPP HH:mm", { locale: getLocale() })
                        ) : (
                          <span>{t("reminders")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
                      <div className="space-y-2">
                        <Calendar
                          mode="single"
                          selected={newTask.reminderDate}
                          onSelect={(date) => {
                            if (date) {
                              // 设置默认时间为上午9点
                              const reminderDate = new Date(date)
                              reminderDate.setHours(9, 0, 0, 0)
                              setNewTask({ ...newTask, reminderDate })
                            } else {
                              setNewTask({ ...newTask, reminderDate: undefined })
                            }
                          }}
                          initialFocus
                          locale={getLocale()}
                        />
                        {newTask.reminderDate && (
                          <div className="mt-4">
                            <Label htmlFor="reminderTime">{t("time")}</Label>
                            <Select
                              value={`${new Date(newTask.reminderDate).getHours()}:${String(new Date(newTask.reminderDate).getMinutes()).padStart(2, "0")}`}
                              onValueChange={(value) => {
                                const [hours, minutes] = value.split(":").map(Number)
                                const newDate = new Date(newTask.reminderDate!)
                                newDate.setHours(hours, minutes, 0, 0)
                                setNewTask({ ...newTask, reminderDate: newDate })
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t("time")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="9:00">{t("morning")} 9:00</SelectItem>
                                <SelectItem value="12:00">{t("noon")} 12:00</SelectItem>
                                <SelectItem value="15:00">{t("afternoon")} 3:00</SelectItem>
                                <SelectItem value="18:00">{t("evening")} 6:00</SelectItem>
                                <SelectItem value="21:00">{t("night")} 9:00</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddTask}>{editTaskId ? t("save") : t("addTask")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showSearch && (
        <div className="mb-4">
          <Input
            type="text"
            placeholder={t("searchTasks")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      <div className="mb-4 flex items-center space-x-2 overflow-x-auto pb-2">
        <Button
          variant={activeCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory(null)}
          className="rounded-full"
        >
          {t("all")}
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category.id)}
            className="rounded-full flex items-center space-x-1"
          >
            {category.icon}
            <span>{t(category.id)}</span>
          </Button>
        ))}
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">{t("all")}</TabsTrigger>
          <TabsTrigger value="todo">{t("pending")}</TabsTrigger>
          <TabsTrigger value="done">{t("completed")}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filterTasks().length > 0 ? (
            filterTasks().map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                categories={categories}
                onToggleComplete={toggleTaskCompletion}
                onEdit={handleEditTask}
                onDelete={deleteTask}
                getPriorityColor={getPriorityColor}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </TabsContent>

        <TabsContent value="todo" className="space-y-4">
          {filterTasks().length > 0 ? (
            filterTasks().map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                categories={categories}
                onToggleComplete={toggleTaskCompletion}
                onEdit={handleEditTask}
                onDelete={deleteTask}
                getPriorityColor={getPriorityColor}
              />
            ))
          ) : (
            <EmptyState message={t("noPendingTasks")} />
          )}
        </TabsContent>

        <TabsContent value="done" className="space-y-4">
          {filterTasks().length > 0 ? (
            filterTasks().map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                categories={categories}
                onToggleComplete={toggleTaskCompletion}
                onEdit={handleEditTask}
                onDelete={deleteTask}
                getPriorityColor={getPriorityColor}
              />
            ))
          ) : (
            <EmptyState message={t("noCompletedTasks")} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TaskCard({
  task,
  categories,
  onToggleComplete,
  onEdit,
  onDelete,
  getPriorityColor,
}: {
  task: Task
  categories: Category[]
  onToggleComplete: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  getPriorityColor: (priority: string) => string
}) {
  const category = categories.find((c) => c.id === task.category)
  const { t, currentLanguage } = useTranslation()

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
    <Card className={cn(task.completed ? "bg-muted" : "")}>
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
              <div className="flex items-center mt-1 space-x-2">
                <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                  {category?.icon}
                  <span>{category?.name}</span>
                </Badge>
                <div className="flex items-center space-x-1">
                  <span className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}></span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {t(task.priority)}
                  </span>
                </div>
              </div>
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
                {t("editTask")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("deleteTask")}
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
      <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex flex-col items-start">
        {task.dueDate && (
          <div className="flex items-center mb-1">
            <CalendarIcon className="mr-2 h-3 w-3" />
            {t("dueDate")}: {format(task.dueDate, "PPP", { locale: getLocale() })}
          </div>
        )}
        {task.reminderDate && (
          <div className="flex items-center">
            <Bell className="mr-2 h-3 w-3" />
            {t("reminders")}: {format(task.reminderDate, "PPP HH:mm", { locale: getLocale() })}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

function EmptyState({ message }: { message?: string }) {
  const { t } = useTranslation()
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Check className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-muted-foreground">{message || t("noTasks")}</h3>
      <p className="text-sm text-muted-foreground mt-1">{t("addTask")}</p>
    </div>
  )
}


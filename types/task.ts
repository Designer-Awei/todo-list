import type { ReactNode } from "react"

export type Task = {
  id: string
  title: string
  description: string
  completed: boolean
  category: string
  priority: string
  dueDate: Date | undefined
  reminderDate: Date | undefined
  createdAt: string
}

export type Category = {
  id: string
  name: string
  color: string
  icon: ReactNode
}


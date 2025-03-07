"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Task } from "@/types/task"

type TaskState = {
  tasks: Task[]
  addTask: (task: Omit<Task, "id" | "completed" | "createdAt">) => void
  updateTask: (id: string, task: Omit<Task, "id" | "completed" | "createdAt">) => void
  deleteTask: (id: string) => void
  toggleTaskCompletion: (id: string) => void
  clearAllTasks: () => void
  importTasks: (tasks: Task[]) => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              id: Date.now().toString(),
              completed: false,
              createdAt: new Date().toISOString(),
              ...task,
            },
          ],
        })),

      updateTask: (id, updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updatedTask } : task)),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      toggleTaskCompletion: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
        })),

      clearAllTasks: () => set({ tasks: [] }),

      importTasks: (importedTasks) => set({ tasks: importedTasks }),
    }),
    {
      name: "task-storage",
    },
  ),
)


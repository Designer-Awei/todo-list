import { create } from "zustand"
import { persist } from "zustand/middleware"

type NotificationState = {
  isEnabled: boolean
  setIsEnabled: (isEnabled: boolean) => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      isEnabled: false,
      setIsEnabled: (isEnabled) => set({ isEnabled }),
    }),
    {
      name: "notification-storage",
    },
  ),
)


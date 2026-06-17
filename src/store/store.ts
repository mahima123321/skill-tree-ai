import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, User } from '@/lib/supabase'

interface AppState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  addXP: (amount: number) => void
  updateStreak: () => void
  logout: () => Promise<void>
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      addXP: (amount) => {
        const user = get().user
        if (user) {
          const newXP = user.xp + amount
          const newLevel = Math.floor(newXP / 100) + 1
          set({ user: { ...user, xp: newXP, level: newLevel } })
        }
      },
      updateStreak: () => {
        const user = get().user
        if (user) {
          set({ user: { ...user, streak: user.streak + 1 } })
        }
      },
      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null })
      },
    }),
    {
      name: 'skilltree-storage',
    }
  )
)

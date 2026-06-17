'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/store/store'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setLoading } = useStore()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    // Check active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser(profile as any)
        }
      } else {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser(profile as any)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])

  if (!mounted) {
    return null
  }

  return <AuthContext.Provider value={{ loading: false }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, Role } from '../lib/data'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  role: Role | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<Profile | null>
  signUp: (fullName: string, email: string, password: string, role?: Role) => Promise<void>
  updateProfile: (updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'pix_key'>>) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  updateProfile: async () => {},
  logout: async () => {},
})

async function loadProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data as Profile | null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      setProfile(sessionUser ? await loadProfile(sessionUser.id) : null)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (!sessionUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      loadProfile(sessionUser.id)
        .then(setProfile)
        .finally(() => setLoading(false))
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    user,
    profile,
    role: profile?.role ?? null,
    loading,
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const nextProfile = data.user ? await loadProfile(data.user.id) : null
      setUser(data.user)
      setProfile(nextProfile)
      return nextProfile
    },
    signUp: async (fullName, email, password, role = 'user') => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      })
      if (error) throw error
    },
    updateProfile: async (updates) => {
      if (!user) throw new Error('Usuario nao autenticado')
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
      if (error) throw error
      setProfile((current) => current ? { ...current, ...updates } : current)
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
      setLoading(false)
    },
  }), [loading, profile, user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

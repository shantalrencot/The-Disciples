import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null; profile: Profile | null }>
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null, profile: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function useAuthProvider(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data as Profile)
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes (e.g. token refresh, sign out, tab sync)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          // Skip re-fetch if we already loaded this user's profile eagerly in signIn
          setProfile(prev => {
            if (prev?.id === session.user.id) return prev
            fetchProfile(session.user.id)
            return prev
          })
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message, profile: null }
    // Eagerly set state so the redirect fires immediately without waiting
    // for the onAuthStateChange round-trip
    let fetchedProfile: Profile | null = null
    if (data.user && data.session) {
      setUser(data.user)
      setSession(data.session)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      fetchedProfile = profileData as Profile | null
      if (fetchedProfile) setProfile(fetchedProfile)
      setLoading(false)
    }
    return { error: null, profile: fetchedProfile }
  }

  async function signUp(email: string, password: string, fullName: string, role = 'student') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })
    if (error) return { error: error.message }
    // Create profile record
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: role as Profile['role'],
      })
    }
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  return { user, profile, session, loading, signIn, signUp, signOut, refreshProfile }
}

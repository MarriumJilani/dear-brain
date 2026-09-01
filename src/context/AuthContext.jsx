import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Step 1: Create the context object — this is the "channel" components tune into
const AuthContext = createContext({})

// Step 2: Create the Provider — this wraps your app and broadcasts auth state
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if there's already a logged-in session when app loads
    // (e.g. user refreshes the page — we don't want to log them out)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes — login, logout, token refresh
    // This fires automatically whenever auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Cleanup: unsubscribe when component unmounts
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Step 3: Provide the value — everything inside { } is available to any consumer
  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Step 4: Custom hook — makes consuming the context clean and readable
export function useAuth() {
  return useContext(AuthContext)
}
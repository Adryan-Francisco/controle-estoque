import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previousUser, setPreviousUser] = useState(null)

  useEffect(() => {
    // Verificar se há uma sessão ativa
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUser = session?.user ?? null
        
        // Se o usuário mudou (logout ou login de outro usuário)
        if (previousUser && previousUser.id !== newUser?.id) {
          console.log('🔄 Usuário mudou, disparando evento de limpeza de dados')
          // Disparar evento customizado para limpeza de dados
          window.dispatchEvent(new CustomEvent('userChanged', { 
            detail: { 
              previousUser, 
              newUser,
              action: newUser ? 'login' : 'logout'
            } 
          }))
        }
        
        setPreviousUser(newUser)
        setUser(newUser)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [previousUser])

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    console.log('🚪 Usuário fazendo logout, limpando dados...')
    
    // Disparar evento de logout para limpeza de dados
    window.dispatchEvent(new CustomEvent('userLogout', { 
      detail: { user } 
    }))
    
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '../types/user.types'

interface AuthContextValue {
  user:      User | null
  token:     string | null
  isLoading: boolean
  isAuth:    boolean
  login:  (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** Extrae string de rol — maneja objeto {id, name, authority} o string directo */
function extractRole(raw: any): User['role'] {
  if (!raw) return 'USER'
  if (typeof raw === 'object') {
    raw = raw.authority ?? raw.name ?? 'USER'
  }
  return String(raw).replace('ROLE_', '') as User['role']
}

/** Decodifica JWT y construye User */
function userFromToken(token: string): User | null {
  try {
    const p = JSON.parse(atob(token.split('.')[1]))
    const rawRole = p.role ?? p.roles?.[0] ?? p.authorities?.[0] ?? 'USER'
    return {
      id:    p.id    ?? p.userId ?? 0,
      name:  p.name  ?? p.username ?? String(p.sub ?? '').split('@')[0] ?? 'Usuario',
      email: p.email ?? p.sub ?? '',
      role:  extractRole(rawRole),
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null)
  const [token,     setToken]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      // Siempre re-decodificar del token para tener el rol correcto
      const u = userFromToken(savedToken)
      if (u) {
        setToken(savedToken)
        setUser(u)
        localStorage.setItem('user', JSON.stringify(u))
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, newUser: User) => {
    // Siempre decodificar del token para obtener rol real
    const decoded = userFromToken(newToken)
    const finalUser = decoded ?? newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(finalUser))
    setToken(newToken)
    setUser(finalUser)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuth: !!token && !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de <AuthProvider>')
  return ctx
}

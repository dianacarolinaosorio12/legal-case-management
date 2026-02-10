"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type SystemUser } from "./mock-data"

interface AuthContextType {
  user: SystemUser | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginByRole: (role: "estudiante" | "profesor" | "administrativo") => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ success: false }),
  loginByRole: async () => ({ success: false }),
  logout: () => {},
  isLoading: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SystemUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("sicop_user")
      const token = sessionStorage.getItem("sicop_token")
      if (stored && token) {
        const parsed = JSON.parse(stored) as SystemUser
        setUser(parsed)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        const userData: SystemUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          area: data.user.area,
          activeCases: data.user.activeCases,
          totalPracticeHours: data.user.totalPracticeHours,
          semester: data.user.semester,
        }
        
        setUser(userData)
        sessionStorage.setItem("sicop_user", JSON.stringify(userData))
        sessionStorage.setItem("sicop_token", data.token)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    } finally {
      setIsLoading(false)
    }
  }

  async function loginByRole(role: "estudiante" | "profesor" | "administrativo"): Promise<{ success: boolean; error?: string }> {
    // Default credentials for demo purposes
    const credentials = {
      estudiante: { email: "mgonzalez@universidad.edu.co", password: "password123" },
      profesor: { email: "jperez@universidad.edu.co", password: "password123" },
      administrativo: { email: "sdiaz@universidad.edu.co", password: "password123" },
    }

    const creds = credentials[role]
    if (!creds) {
      return { success: false, error: 'Invalid role' }
    }

    return login(creds.email, creds.password)
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem("sicop_user")
    sessionStorage.removeItem("sicop_token")
  }

  return (
    <AuthContext.Provider value={{ user, login, loginByRole, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { mockUsers, type SystemUser } from "./mock-data"

interface AuthContextType {
  user: SystemUser | null
  login: (userId: string) => void
  loginByRole: (role: "estudiante" | "profesor" | "administrativo") => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  loginByRole: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SystemUser | null>(null)

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("sicop_user")
      if (stored) {
        const parsed = JSON.parse(stored) as SystemUser
        setUser(parsed)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  function login(userId: string) {
    const found = mockUsers.find((u) => u.id === userId)
    if (found) {
      setUser(found)
      sessionStorage.setItem("sicop_user", JSON.stringify(found))
    }
  }

  function loginByRole(role: "estudiante" | "profesor" | "administrativo") {
    const found = mockUsers.find((u) => u.role === role)
    if (found) {
      setUser(found)
      sessionStorage.setItem("sicop_user", JSON.stringify(found))
    }
  }

  function logout() {
    setUser(null)
    sessionStorage.removeItem("sicop_user")
  }

  return (
    <AuthContext.Provider value={{ user, login, loginByRole, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

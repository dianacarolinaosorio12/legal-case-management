"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import apiClient from "@/lib/api-client"

interface User {
  id: string
  name: string
  email: string
  role: "estudiante" | "profesor" | "administrativo"
  area?: string
  activeCases?: number
  semester?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isEstudiante: boolean
  isProfesor: boolean
  isAdmin: boolean
  hasRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("sicop_token")
    const storedUser = localStorage.getItem("sicop_user")

    if (storedToken && storedUser) {
      try {
        const tokenParts = storedToken.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          const expirationTime = payload.exp * 1000
          const now = Date.now()
          
          if (expirationTime < now) {
            console.log('Token expired, logging out...')
            localStorage.removeItem("sicop_token")
            localStorage.removeItem("sicop_user")
            window.location.replace("/login?expired=true")
            return
          }
          
          setTimeout(() => {
            console.log('Token expiring soon, logging out...')
            localStorage.removeItem("sicop_token")
            localStorage.removeItem("sicop_user")
            window.location.replace("/login?expired=true")
          }, expirationTime - now)
        }
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("sicop_token")
        localStorage.removeItem("sicop_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiClient.auth.login(email, password) as { token: string; user: User }
    
    localStorage.setItem("sicop_token", response.token)
    localStorage.setItem("sicop_user", JSON.stringify(response.user))
    
    setToken(response.token)
    setUser(response.user)
  }

  const logout = () => {
    localStorage.removeItem("sicop_token")
    localStorage.removeItem("sicop_user")
    sessionStorage.clear()
    setToken(null)
    setUser(null)
    window.location.replace("/login")
  }

  const isEstudiante = user?.role === "estudiante"
  const isProfesor = user?.role === "profesor"
  const isAdmin = user?.role === "administrativo"
  
  const hasRole = (roles: string[]) => user ? roles.includes(user.role) : false

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, isEstudiante, isProfesor, isAdmin, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthContext

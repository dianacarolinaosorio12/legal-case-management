"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push(`${redirectTo}?callbackUrl=${pathname}`)
      return
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const roleDashboard = getDashboardForRole(user.role)
      router.push(roleDashboard)
      return
    }
  }, [user, isLoading, allowedRoles, redirectTo, pathname, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

export function getDashboardForRole(role: string): string {
  switch (role) {
    case "profesor":
      return "/profesor"
    case "administrativo":
      return "/admin"
    case "estudiante":
    default:
      return "/dashboard"
  }
}

export function getHomePathForRole(role: string): string {
  return getDashboardForRole(role)
}

"use client"

import React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useAuth } from "@/lib/auth-context"
import { AIChat } from "@/components/ai-chat"
import { ProtectedRoute } from "@/lib/protected-route"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const name = user?.name || "Estudiante"

  return (
    <ProtectedRoute allowedRoles={["estudiante"]}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader userName={name} />
          <div className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </div>
        </SidebarInset>
        <AIChat />
      </SidebarProvider>
    </ProtectedRoute>
  )
}

"use client"

import React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AppHeader } from "@/components/app-header"
import { useAuth } from "@/lib/auth-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const name = user?.name || "Admin Sistema"

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AppHeader userName={name} />
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

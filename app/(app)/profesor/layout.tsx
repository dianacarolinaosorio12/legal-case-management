"use client"

import React, { Suspense } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ProfessorSidebar } from "@/components/professor-sidebar"
import { AppHeader } from "@/components/app-header"
import { useAuth } from "@/lib/auth-context"

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const name = user?.name || "Profesor"

  return (
    <SidebarProvider>
      <Suspense>
        <ProfessorSidebar />
      </Suspense>
      <SidebarInset>
        <AppHeader userName={name} />
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

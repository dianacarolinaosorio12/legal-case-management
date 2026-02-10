"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FolderOpen,
  FilePlus,
  Calendar,
  Scale,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  { label: "Mis Casos", href: "/dashboard/casos", icon: FolderOpen },
  { label: "Nuevo Caso", href: "/dashboard/nuevo-caso", icon: FilePlus },
  { label: "Calendario", href: "/dashboard/calendario", icon: Calendar },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const studentName = user?.name || "Estudiante"

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/dashboard/casos" className="flex items-center gap-3" aria-label="SICOP - Inicio">
          <div className="flex items-center justify-center rounded-xl bg-white/10 p-2 backdrop-blur-sm border border-white/10">
            <Scale className="text-amber-300" size={22} aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white">
              SICOP
            </span>
            <span className="text-xs text-sidebar-foreground/60">Control de Procesos</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="sidebar-scroll">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Navegacion
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href === "/dashboard/casos" && pathname.startsWith("/dashboard/casos"))
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon size={20} aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
          <p className="text-[10px] text-amber-300/60 leading-tight">
            {studentName}
          </p>
          <p className="text-[10px] text-sidebar-foreground/40 leading-tight">
            Consultorio Juridico Universitario
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

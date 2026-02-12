"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Inbox,
  Calendar,
  Scale,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
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

const navItems = [
  { label: "Bandeja", href: "/profesor", icon: Inbox, badge: "5" },
  { label: "Calendario", href: "/profesor/calendario", icon: Calendar },
]

export function ProfessorSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const professorArea = user?.area || "Laboral"

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/profesor" className="flex items-center gap-3" aria-label="SICOP Profesor - Inicio">
          <div className="flex items-center justify-center rounded-xl bg-white/10 p-2 backdrop-blur-sm border border-white/10">
            <Scale className="text-amber-300" size={22} aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white">SICOP</span>
            <span className="text-xs text-amber-300/80">Panel del Profesor</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="sidebar-scroll">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Revision de Casos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon size={20} aria-hidden="true" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                            {item.badge}
                          </span>
                        )}
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
          <p className="text-[10px] text-sidebar-foreground/40 leading-tight">
            Universitaria de Colombia
          </p>
          <p className="text-[10px] text-amber-300/60 leading-tight">
            Area: {professorArea}
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

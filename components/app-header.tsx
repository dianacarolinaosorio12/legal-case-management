"use client"

import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, UserCircle, LogOut } from "lucide-react"
import { useEffect, useState } from "react"

export function AppHeader({ userName = "Maria Gonzalez" }: { userName?: string }) {
  const { logout } = useAuth()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const profileHref = pathname.startsWith("/admin")
    ? "/admin/perfil"
    : pathname.startsWith("/profesor")
      ? "/profesor/perfil"
      : "/dashboard/perfil"

  const roleLabel = pathname.startsWith("/admin")
    ? "Administrador"
    : pathname.startsWith("/profesor")
      ? "Profesor"
      : "Estudiante"

  const initials = mounted && userName ? userName.split(" ").map((n) => n[0]).join("") : "MG"

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border/60 bg-card/80 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between gap-2 px-3 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-8 w-8 text-foreground/70 hover:bg-muted hover:text-foreground transition-colors" />
          <Separator orientation="vertical" className="mr-1 h-4 hidden md:block" />
          <span className="text-sm font-semibold text-foreground md:hidden">SICOP</span>
        </div>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2.5 h-9 px-3 text-foreground hover:bg-muted/80 rounded-full transition-colors">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[11px] font-bold text-white ring-2 ring-primary/20">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium leading-tight max-w-[120px] truncate" suppressHydrationWarning>{userName}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{roleLabel}</span>
                </div>
                <ChevronDown size={14} className="hidden sm:block text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border-border/60">
              <div className="px-3 py-2 sm:hidden">
                <p className="text-sm font-medium text-foreground" suppressHydrationWarning>{userName}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                <Link href={profileHref}>
                  <UserCircle size={16} />
                  Mi perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                <Link href="/login" onClick={() => logout()}>
                  <LogOut size={16} />
                  Cerrar sesion
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

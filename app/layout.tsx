import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
})

export const metadata: Metadata = {
  title: "SICOP - Sistema de Control de Procesos",
  description:
    "Plataforma de gestion de casos juridicos para el Consultorio Juridico Universitario",
}

export const viewport: Viewport = {
  themeColor: "#030568",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

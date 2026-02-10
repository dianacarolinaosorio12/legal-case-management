import { Scale } from "lucide-react"

export function SicopLogo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { icon: 20, text: "text-lg", sub: "text-xs", pad: "p-1.5", gap: "gap-2" },
    default: { icon: 28, text: "text-2xl", sub: "text-sm", pad: "p-2.5", gap: "gap-3" },
    large: { icon: 40, text: "text-4xl", sub: "text-base", pad: "p-3", gap: "gap-4" },
  }
  const s = sizes[size]

  return (
    <div className={`flex items-center ${s.gap}`}>
      <div className={`flex items-center justify-center rounded-xl bg-gradient-navy ${s.pad} shadow-lg`}>
        <Scale className="text-amber-300" size={s.icon} aria-hidden="true" />
      </div>
      <div className="flex flex-col">
        <span className={`${s.text} font-bold tracking-tight text-primary`}>
          SICOP
        </span>
        <span className={`${s.sub} text-muted-foreground leading-none`}>
          Sistema de Control de Procesos
        </span>
      </div>
    </div>
  )
}

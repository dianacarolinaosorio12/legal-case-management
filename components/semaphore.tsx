import { cn } from "@/lib/utils"

type SemaphoreColor = "red" | "yellow" | "green"

const colorMap: Record<SemaphoreColor, { border: string; bg: string; label: string }> = {
  red: {
    border: "border-destructive",
    bg: "bg-destructive",
    label: "Urgente",
  },
  yellow: {
    border: "border-warning",
    bg: "bg-warning",
    label: "Precaucion",
  },
  green: {
    border: "border-success",
    bg: "bg-success",
    label: "En tiempo",
  },
}

export function Semaphore({
  color,
  size = "sm",
  showLabel = false,
}: {
  color: SemaphoreColor
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}) {
  const config = colorMap[color]
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          "rounded-full border-2",
          sizeClasses[size],
          config.border,
          config.bg
        )}
        role="img"
        aria-label={`Semaforo: ${config.label}`}
      />
      {showLabel && (
        <span
          className={cn(
            "text-sm font-medium",
            color === "red" && "text-destructive",
            color === "yellow" && "text-warning-foreground",
            color === "green" && "text-success"
          )}
        >
          {config.label}
        </span>
      )}
    </span>
  )
}

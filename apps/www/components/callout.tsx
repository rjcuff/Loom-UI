import { AlertTriangleIcon, InfoIcon, LightbulbIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const ICONS = {
  info: InfoIcon,
  tip: LightbulbIcon,
  warning: AlertTriangleIcon,
} as const

export function Callout({
  type = "info",
  title,
  className,
  children,
}: {
  type?: keyof typeof ICONS
  title?: string
  className?: string
  children?: React.ReactNode
}) {
  const Icon = ICONS[type]

  return (
    <div
      data-slot="callout"
      className={cn(
        "border-border bg-surface my-5 flex gap-3 rounded-lg border px-4 py-3 text-sm",
        type === "warning" && "border-destructive/40",
        className
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          type === "warning" ? "text-destructive" : "text-accent"
        )}
      />
      <div className="min-w-0 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {title ? <p className="mb-1 font-medium">{title}</p> : null}
        {children}
      </div>
    </div>
  )
}

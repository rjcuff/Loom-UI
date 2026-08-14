"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { IconSwap } from "@/components/icon-swap"

export function CopyButton({
  value,
  className,
  label = "Copy code",
}: {
  value: string
  className?: string
  label?: string
}) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch (error) {
      console.error("Clipboard write failed", error)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      className={cn(
        // No background, no hover fill. Only the icon reacts.
        "text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 absolute top-2 right-2 z-10 grid size-8 place-items-center rounded-md opacity-0 transition-[opacity,color] duration-150 outline-none group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2",
        className
      )}
    >
      <IconSwap
        swapped={copied}
        from={<CopyIcon className="size-4" />}
        to={<CheckIcon className="text-accent size-4" />}
      />
    </button>
  )
}

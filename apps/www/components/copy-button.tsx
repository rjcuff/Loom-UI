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
        "text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 absolute top-2 right-2 z-10 grid size-8 place-items-center rounded-md transition-[opacity,color] duration-150 outline-none focus-visible:ring-2",
        // Touch devices have no hover, so a reveal-on-hover button is simply
        // never reachable there. It stays visible, with a backdrop so it does
        // not sit unreadably on top of the first line of code.
        "bg-code/85 opacity-100 backdrop-blur-[2px]",
        // No background, no hover fill where a real pointer exists. Only the
        // icon reacts.
        "pointer-fine:bg-transparent pointer-fine:opacity-0 pointer-fine:backdrop-blur-none pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:opacity-100",
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

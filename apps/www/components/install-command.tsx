"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { IconSwap } from "@/components/icon-swap"

export function InstallCommand({
  command,
  className,
}: {
  command: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
    } catch (error) {
      console.error("Clipboard write failed", error)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : `Copy: ${command}`}
      className={cn(
        "group border-border bg-surface/60 hover:border-accent/40 flex items-center gap-3 rounded-lg border px-4 py-2.5 font-mono text-sm backdrop-blur",
        // The box itself stays put on press. Only the icon reacts.
        "ease-out-quart transition-[border-color] duration-150",
        className
      )}
    >
      <span className="text-muted-foreground select-none">$</span>
      <span className="text-foreground">{command}</span>
      <IconSwap
        swapped={copied}
        className="text-muted-foreground group-hover:text-accent ml-1 transition-colors duration-150"
        from={<CopyIcon className="size-3.5" />}
        to={<CheckIcon className="text-accent size-3.5" />}
      />
    </button>
  )
}

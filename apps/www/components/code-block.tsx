"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-button"

/**
 * Wraps MDX code fences so every block gets a copy button without needing a
 * remark plugin to stash the raw source. We read it back off the DOM.
 */
export function CodeBlock({
  className,
  children,
  ...props
}: React.ComponentProps<"pre">) {
  const ref = React.useRef<HTMLPreElement>(null)
  const [value, setValue] = React.useState("")

  React.useEffect(() => {
    setValue(ref.current?.textContent ?? "")
  }, [children])

  return (
    <div className="group relative">
      <CopyButton value={value} />
      <pre ref={ref} className={cn(className)} {...props}>
        {children}
      </pre>
    </div>
  )
}

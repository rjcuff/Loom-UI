"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function CodeCollapsibleWrapper({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Collapsible>) {
  const [open, setOpen] = React.useState(false)

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        "group/collapsible my-4",
        // The figure carries its own block margin so it can stand alone in
        // MDX; inside the wrapper it would open a gap above the footer bar.
        "[&_figure]:my-0",
        // The trigger below is the block's bottom edge, so the code box gives
        // up its own.
        "[&_pre]:rounded-b-none [&_pre]:border-b-0",
        className
      )}
      {...props}
    >
      <CollapsibleContent
        forceMount
        className={cn(
          "relative overflow-hidden",
          !open && "max-h-72 [&_pre]:overflow-hidden"
        )}
      >
        {children}
        {!open ? (
          <div className="from-code pointer-events-none absolute inset-x-px bottom-0 h-24 bg-gradient-to-t to-transparent" />
        ) : null}
      </CollapsibleContent>
      {/* A full-width bar rather than a button floating over the code: it
          cannot collide with the copy button or a long file path, and it reads
          the same at every width. */}
      <CollapsibleTrigger className="border-border bg-code text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 flex w-full items-center justify-center gap-1.5 rounded-b-lg border py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-inset">
        {open ? "Collapse" : "Expand"}
        <ChevronDownIcon className="size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
      </CollapsibleTrigger>
    </Collapsible>
  )
}

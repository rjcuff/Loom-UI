"use client"

import * as React from "react"
import { ChevronsDownUpIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
      className={cn("group/collapsible relative my-4", className)}
      {...props}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground absolute top-2 right-11 z-10"
        >
          {open ? <ChevronsDownUpIcon /> : <ChevronsUpDownIcon />}
          {open ? "Collapse" : "Expand"}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent
        forceMount
        className={cn(
          "relative overflow-hidden",
          !open && "max-h-72 [&_pre]:overflow-hidden"
        )}
      >
        {children}
        {!open ? (
          <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent" />
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  )
}

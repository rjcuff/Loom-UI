"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { DocsNav } from "@/components/docs-nav"
import { IconSwap } from "@/components/icon-swap"

export function DocsMobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  // Close the panel whenever the route changes, otherwise it stays open
  // behind the new page.
  React.useEffect(() => setOpen(false), [pathname])

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border-border border-b lg:hidden"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground w-full justify-between rounded-none px-5 py-3"
        >
          <span className="flex items-center gap-2">
            <IconSwap
              swapped={open}
              from={<MenuIcon className="size-4" />}
              to={<XIcon className="size-4" />}
            />
            Menu
          </span>
          <ChevronDownIcon
            className="ease-out-quart size-4 transition-[rotate] duration-180 data-[open=true]:rotate-180 motion-reduce:transition-none"
            data-open={open}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-5 pt-1 pb-5">
        <DocsNav onNavigate={() => setOpen(false)} />
      </CollapsibleContent>
    </Collapsible>
  )
}

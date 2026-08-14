"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { IconSwap } from "@/components/icon-swap"

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      // Hold the label back until the theme is known, so screen readers never
      // announce the wrong direction during hydration.
      aria-label={
        mounted
          ? `Switch to ${isDark ? "light" : "dark"} theme`
          : "Toggle theme"
      }
      className="text-muted-foreground hover:text-foreground"
    >
      <IconSwap
        swapped={isDark}
        from={<MoonIcon className="size-4" />}
        to={<SunIcon className="size-4" />}
      />
    </Button>
  )
}

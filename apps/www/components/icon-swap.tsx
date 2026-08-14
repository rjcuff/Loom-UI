import { cn } from "@/lib/utils"

interface IconSwapProps {
  /** When false the `from` icon is shown; when true, the `to` icon. */
  swapped: boolean
  from: React.ReactNode
  to: React.ReactNode
  className?: string
}

/**
 * Crossfades two icons in place: the outgoing one shrinks and fades out while
 * the incoming one fades in and grows back to full size.
 *
 * Motion notes (see .claude/skills/animations/SKILL.md):
 * - Only `opacity` and `transform` animate, so this stays on the compositor.
 * - Both icons are a paired unit, so they share one duration and one easing.
 * - Icons shrink to 0.75, never to 0. An icon that scales to nothing pops out
 *   of existence instead of receding.
 * - Both icons occupy the same grid cell, so the swap causes no layout shift
 *   and the button never resizes mid-transition.
 *
 * Note: Tailwind v4 compiles `scale-*` to the independent `scale` property,
 * not `transform`, so the transition must name `scale` explicitly.
 */
export function IconSwap({ swapped, from, to, className }: IconSwapProps) {
  return (
    <span
      className={cn("grid size-4 shrink-0 place-items-center", className)}
      aria-hidden
    >
      <span
        data-visible={!swapped}
        className="ease-out-quart col-start-1 row-start-1 flex transition-[opacity,scale] duration-180 data-[visible=false]:scale-75 data-[visible=false]:opacity-0 data-[visible=true]:scale-100 data-[visible=true]:opacity-100 motion-reduce:transition-none"
      >
        {from}
      </span>
      <span
        data-visible={swapped}
        className="ease-out-quart col-start-1 row-start-1 flex transition-[opacity,scale] duration-180 data-[visible=false]:scale-75 data-[visible=false]:opacity-0 data-[visible=true]:scale-100 data-[visible=true]:opacity-100 motion-reduce:transition-none"
      >
        {to}
      </span>
    </span>
  )
}

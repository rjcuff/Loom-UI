import { ReadingProgress } from "@/registry/loomui/reading-progress"

export default function ReadingProgressDemo() {
  return (
    <div className="w-full max-w-md text-center">
      {/* Really pinned to the top of the viewport, not to this preview. */}
      <ReadingProgress thickness={3} />
      <p className="text-muted-foreground text-sm">
        The bar is live at the very top of this page. Scroll and it fills.
      </p>
    </div>
  )
}

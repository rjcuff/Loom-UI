import { StitchPath } from "@/registry/loomui/stitch-path"

export default function StitchPathDemo() {
  return (
    <div className="w-full max-w-2xl">
      <p className="text-muted-foreground text-sm">
        Cut the pieces, lay them out, and pin them down.
      </p>

      <div className="h-28 py-4">
        <StitchPath className="text-primary" />
      </div>

      <p className="text-muted-foreground text-sm">
        Scroll the page and the thread follows you down it.
      </p>
    </div>
  )
}

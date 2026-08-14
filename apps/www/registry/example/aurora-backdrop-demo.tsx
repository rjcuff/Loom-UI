import { AuroraBackdrop } from "@/registry/loomui/aurora-backdrop"

export default function AuroraBackdropDemo() {
  return (
    <div className="bg-background relative flex h-64 w-full items-center justify-center overflow-hidden rounded-xl border">
      <AuroraBackdrop seed={7} />
      <div className="relative text-center">
        <p className="text-xl font-medium tracking-tight">
          Weather, not wallpaper
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Four blobs on cycles that never line up
        </p>
      </div>
    </div>
  )
}

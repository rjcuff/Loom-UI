import { GridBackdrop } from "@/registry/loomui/grid-backdrop"

export default function GridBackdropDemo() {
  return (
    <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-xl border">
      <GridBackdrop width={32} height={32} squares={18} />
      <p className="relative text-xl font-medium tracking-tight">
        Quiet behind the content
      </p>
    </div>
  )
}

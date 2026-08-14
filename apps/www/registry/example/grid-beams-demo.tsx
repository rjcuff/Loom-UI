import { GridBeams } from "@/registry/loomui/grid-beams"

export default function GridBeamsDemo() {
  return (
    <div className="bg-background relative flex h-72 w-full items-center justify-center overflow-hidden rounded-xl border">
      <GridBeams />
      <div className="relative text-center">
        <p className="text-xl font-medium tracking-tight">Signal on the wire</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Seven beams, seeded onto random columns
        </p>
      </div>
    </div>
  )
}

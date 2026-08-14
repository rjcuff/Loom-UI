import { TiltCard } from "@/registry/loomui/tilt-card"

export default function TiltCardDemo() {
  return (
    <TiltCard className="w-72 rounded-xl">
      <div className="bg-card rounded-xl border p-6">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">
          Loom UI
        </p>
        <h3 className="mt-3 text-lg font-medium tracking-tight">
          Pick it up and look at it
        </h3>
        <p className="text-muted-foreground mt-2 text-sm">
          The card leans away from the pointer and settles back on its own.
        </p>
      </div>
    </TiltCard>
  )
}

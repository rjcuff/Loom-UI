import { LoomLoader } from "@/registry/loomui/loom-loader"

export default function LoomLoaderDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <div className="flex flex-col items-center gap-3">
        <LoomLoader className="size-6" strands={3} />
        <span className="text-muted-foreground text-xs">Small</span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <LoomLoader className="size-10" />
        <span className="text-muted-foreground text-xs">Default</span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <LoomLoader
          className="text-accent size-16"
          strands={7}
          duration={2000}
        />
        <span className="text-muted-foreground text-xs">Wide and slow</span>
      </div>
    </div>
  )
}

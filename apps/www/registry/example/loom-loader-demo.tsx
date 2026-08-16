import { LoomLoader } from "@/registry/loomui/loom-loader"

const SIZES = [
  { label: "Small", className: "size-6", strands: 3, duration: 1400 },
  { label: "Default", className: "size-10", strands: 5, duration: 1400 },
  {
    label: "Wide and slow",
    className: "text-accent size-16",
    strands: 7,
    duration: 2000,
  },
]

export default function LoomLoaderDemo() {
  return (
    <div className="grid w-full max-w-md grid-cols-3 gap-4 sm:gap-8">
      {SIZES.map((size) => (
        <div key={size.label} className="flex flex-col items-center gap-4">
          {/* A fixed slot so three different sizes share one baseline and the
              labels below them line up. */}
          <div className="grid h-16 place-items-center">
            <LoomLoader
              className={size.className}
              strands={size.strands}
              duration={size.duration}
            />
          </div>
          <span className="text-muted-foreground text-center text-xs text-balance">
            {size.label}
          </span>
        </div>
      ))}
    </div>
  )
}

import { BentoCard, BentoGrid } from "@/registry/loomui/bento-grid"

export default function BentoGridDemo() {
  return (
    <BentoGrid className="w-full max-w-2xl">
      <BentoCard
        className="sm:col-span-2"
        title="Copied, not installed"
        description="Every component lands in your repo as one file you own outright."
      >
        <div className="mt-4 flex gap-1.5">
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className="bg-primary/15 h-8 flex-1 rounded"
              style={{ opacity: 1 - index * 0.15 }}
            />
          ))}
        </div>
      </BentoCard>

      <BentoCard
        title="Motion first"
        description="Every piece animates for a reason."
      />

      <BentoCard
        title="Themed"
        description="Light and dark from the same tokens."
      />

      <BentoCard
        className="sm:col-span-2"
        title="No runtime"
        description="No animation library, no provider, no context to wire up."
        footer={
          <span className="text-muted-foreground font-mono text-xs">
            0 dependencies
          </span>
        }
      />
    </BentoGrid>
  )
}

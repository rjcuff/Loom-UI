import { CompareSlider } from "@/registry/loomui/compare-slider"

function Panel({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`h-full w-full p-4 sm:p-6 ${className ?? ""}`}>
      <div className="text-[0.65rem] tracking-[0.2em] uppercase opacity-60">
        {label}
      </div>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  )
}

export default function CompareSliderDemo() {
  return (
    <CompareSlider
      label="Compare the draft with the shipped page"
      className="h-64 w-full max-w-2xl rounded-xl border"
      before={
        <Panel label="Draft" className="bg-muted text-muted-foreground">
          <div className="bg-foreground/15 h-3 w-full max-w-40 rounded-full" />
          <div className="bg-foreground/10 h-3 w-full max-w-56 rounded-full" />
          <div className="bg-foreground/10 h-3 w-full max-w-48 rounded-full" />
          <div className="bg-foreground/10 mt-6 h-9 w-28 rounded-md" />
        </Panel>
      }
      after={
        <Panel
          label="Shipped"
          className="from-primary/15 via-background to-background text-foreground bg-linear-to-br"
        >
          <div className="bg-primary h-3 w-full max-w-40 rounded-full" />
          <div className="bg-foreground/30 h-3 w-full max-w-56 rounded-full" />
          <div className="bg-foreground/20 h-3 w-full max-w-48 rounded-full" />
          <div className="bg-primary text-primary-foreground mt-6 grid h-9 w-28 place-items-center rounded-md text-xs font-medium">
            Get started
          </div>
        </Panel>
      }
    />
  )
}

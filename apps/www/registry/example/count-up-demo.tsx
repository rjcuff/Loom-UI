import { CountUp } from "@/registry/loomui/count-up"

export default function CountUpDemo() {
  return (
    <div className="grid w-full max-w-md grid-cols-3 gap-6 text-center">
      <div>
        <CountUp
          value={48291}
          className="text-3xl font-semibold tracking-tight"
        />
        <p className="text-muted-foreground mt-1 text-xs">Installs</p>
      </div>
      <div>
        <CountUp
          value={99.9}
          decimals={1}
          suffix="%"
          className="text-3xl font-semibold tracking-tight"
        />
        <p className="text-muted-foreground mt-1 text-xs">Uptime</p>
      </div>
      <div>
        <CountUp
          value={12}
          prefix="$"
          suffix="M"
          className="text-3xl font-semibold tracking-tight"
        />
        <p className="text-muted-foreground mt-1 text-xs">Processed</p>
      </div>
    </div>
  )
}

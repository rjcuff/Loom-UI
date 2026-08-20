import { ChartRange } from "@/registry/lib/chart-frame"
import { FunnelRows } from "@/registry/loomui/funnel-rows"

const STAGES = [
  { name: "Invited", value: 2840 },
  { name: "Opened", value: 1960 },
  { name: "Started", value: 1180 },
  { name: "Finished", value: 640 },
  { name: "Verified", value: 415 },
  { name: "Renewed", value: 168 },
]

export default function FunnelRowsDemo() {
  return (
    <FunnelRows
      className="max-w-xl"
      stages={STAGES}
      label="Onboarding"
      delta={-1.8}
      range={<ChartRange>This month</ChartRange>}
    />
  )
}

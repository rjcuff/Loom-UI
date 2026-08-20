import { ChartRange } from "@/registry/lib/chart-frame"
import { GaugeArc } from "@/registry/loomui/gauge-arc"

const SEGMENTS = [
  { name: "Search", value: 4820 },
  { name: "Direct", value: 2140 },
  { name: "Social", value: 1360 },
  { name: "Newsletter", value: 890 },
]

export default function GaugeArcDemo() {
  return (
    <GaugeArc
      className="max-w-md"
      segments={SEGMENTS}
      label="Sessions by source"
      delta={6.7}
      range={<ChartRange>Last 30 days</ChartRange>}
    />
  )
}

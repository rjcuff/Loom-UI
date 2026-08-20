import { ChartRange } from "@/registry/lib/chart-frame"
import { TrendStack } from "@/registry/loomui/trend-stack"

const WEEKS = [
  "W1",
  "W2",
  "W3",
  "W4",
  "W5",
  "W6",
  "W7",
  "W8",
  "W9",
  "W10",
  "W11",
  "W12",
  "W13",
]

const SERIES = [
  {
    name: "Edge",
    values: [
      3420, 3610, 3380, 3990, 4270, 4180, 4640, 4910, 4780, 5330, 5610, 5840,
      6120,
    ],
  },
  {
    name: "Origin",
    values: [
      2180, 2040, 2360, 2290, 2510, 2740, 2660, 2880, 3070, 2990, 3240, 3410,
      3520,
    ],
  },
  {
    name: "Cache miss",
    values: [
      860, 940, 780, 1020, 1110, 970, 1230, 1180, 1340, 1290, 1450, 1380, 1510,
    ],
  },
]

export default function TrendStackDemo() {
  return (
    <TrendStack
      className="max-w-xl"
      series={SERIES}
      labels={WEEKS}
      label="Requests served"
      delta={11.4}
      range={<ChartRange>Last quarter</ChartRange>}
    />
  )
}

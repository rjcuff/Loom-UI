import { Typewriter } from "@/registry/loomui/typewriter"

export default function TypewriterDemo() {
  return (
    <p className="text-2xl font-medium tracking-tight">
      Built for{" "}
      <Typewriter
        className="text-primary"
        words={["landing pages", "dashboards", "docs sites", "changelogs"]}
      />
    </p>
  )
}

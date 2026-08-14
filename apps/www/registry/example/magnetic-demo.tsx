import { Magnetic } from "@/registry/loomui/magnetic"

export default function MagneticDemo() {
  return (
    <Magnetic asChild strength={0.4} radius={90}>
      <button className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium">
        Hover near me
      </button>
    </Magnetic>
  )
}

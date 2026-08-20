import { LightCurtain } from "@/registry/loomui/light-curtain"

export default function LightCurtainDemo() {
  return (
    <div className="bg-background relative flex h-72 w-full max-w-2xl items-center justify-center overflow-hidden rounded-xl border">
      <LightCurtain />

      <p className="relative text-center text-2xl font-semibold tracking-tight text-balance">
        Light falling from the top edge
      </p>
    </div>
  )
}

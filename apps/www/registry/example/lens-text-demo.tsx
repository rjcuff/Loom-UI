import { LensText } from "@/registry/loomui/lens-text"

export default function LensTextDemo() {
  return (
    <div className="text-center">
      <LensText
        ring
        size={130}
        blur={8}
        magnify={1.04}
        follow={150}
        className="text-5xl font-semibold tracking-tight sm:text-6xl"
      >
        Hover me
      </LensText>
    </div>
  )
}

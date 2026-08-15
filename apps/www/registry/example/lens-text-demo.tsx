import { LensText } from "@/registry/loomui/lens-text"

export default function LensTextDemo() {
  return (
    <div className="max-w-md text-center">
      <p className="text-muted-foreground text-xs tracking-wide uppercase">
        Spoiler
      </p>
      <LensText
        ring
        size={120}
        blur={7}
        magnify={1.06}
        follow={150}
        className="mt-3 text-base leading-relaxed font-medium text-balance"
      >
        The lens is two copies of the same words. The one you can read is
        clipped to a circle at the pointer, and the blurred one has that same
        circle punched out of it.
      </LensText>
      <p className="text-muted-foreground mt-4 text-xs">
        Move the pointer across the text
      </p>
    </div>
  )
}

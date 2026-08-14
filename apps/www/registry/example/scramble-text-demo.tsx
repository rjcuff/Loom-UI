import { ScrambleText } from "@/registry/loomui/scramble-text"

export default function ScrambleTextDemo() {
  return (
    <div className="text-center">
      <p className="text-muted-foreground text-sm">Now decoding</p>
      <ScrambleText
        text="LOOM UI"
        trigger="hover"
        className="mt-2 font-mono text-4xl font-semibold tracking-tight sm:text-5xl"
      />
      <p className="text-muted-foreground mt-4 text-xs">
        Hover to run it again
      </p>
    </div>
  )
}

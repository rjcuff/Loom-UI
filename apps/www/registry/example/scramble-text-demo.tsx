import { ScrambleText } from "@/registry/loomui/scramble-text"

export default function ScrambleTextDemo() {
  return (
    <div className="text-center">
      <ScrambleText
        text="LOOM UI"
        trigger="hover"
        className="mt-2 font-mono text-4xl font-semibold tracking-tight sm:text-5xl"
      />
      <p className="text-muted-foreground mt-4 text-xs">
        Hover it. Again. We do not judge.
      </p>
    </div>
  )
}

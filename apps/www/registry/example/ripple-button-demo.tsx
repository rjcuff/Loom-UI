import { RippleButton } from "@/registry/loomui/ripple-button"

export default function RippleButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <RippleButton className="bg-primary text-primary-foreground rounded-md px-5 py-2.5 text-sm font-medium">
        Press anywhere
      </RippleButton>

      <RippleButton
        color="color-mix(in oklch, var(--accent) 30%, transparent)"
        className="border-border rounded-md border px-5 py-2.5 text-sm font-medium"
      >
        Tinted
      </RippleButton>

      <RippleButton
        duration={1100}
        className="bg-card text-card-foreground rounded-full border px-5 py-2.5 text-sm font-medium"
      >
        Slow
      </RippleButton>
    </div>
  )
}

import { StaggerText } from "@/registry/loomui/stagger-text"

export default function StaggerTextDemo() {
  return (
    <p className="max-w-md text-center text-2xl font-medium tracking-tight text-balance">
      <StaggerText startOnView repeat>
        Every word arrives on its own beat.
      </StaggerText>
    </p>
  )
}

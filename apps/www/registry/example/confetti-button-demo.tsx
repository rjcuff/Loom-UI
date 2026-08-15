import { ConfettiButton } from "@/registry/loomui/confetti-button"

export default function ConfettiButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <ConfettiButton className="bg-primary text-primary-foreground rounded-md px-5 py-2.5 text-sm font-medium">
        Ship it
      </ConfettiButton>

      <ConfettiButton
        count={34}
        spread={140}
        duration={1200}
        className="border-border rounded-full border px-5 py-2.5 text-sm font-medium"
      >
        Bigger party
      </ConfettiButton>

      <ConfettiButton
        count={10}
        spread={60}
        colors={["#f472b6", "#c084fc", "#818cf8"]}
        className="bg-card text-card-foreground rounded-md border px-5 py-2.5 text-sm font-medium"
      >
        Just a little
      </ConfettiButton>
    </div>
  )
}

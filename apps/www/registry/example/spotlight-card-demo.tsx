import { SpotlightCard } from "@/registry/loomui/spotlight-card"

const CARDS = [
  {
    title: "Copy, do not install",
    body: "The source lands in your repo. Change it, delete half of it, rename it.",
    href: "/docs/installation",
  },
  {
    title: "Motion with a contract",
    body: "Every component ships an off switch and respects reduced motion.",
    href: "/docs/components/weave-text",
  },
]

export default function SpotlightCardDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      {CARDS.map((card) => (
        <SpotlightCard key={card.title} interactive className="bg-card p-5">
          <h3 className="text-sm font-medium">
            {/* Stretched link: the whole card is the hit target, but the
                accessible name and the href stay on a real anchor. */}
            <a href={card.href} className="after:absolute after:inset-0">
              {card.title}
            </a>
          </h3>
          <p className="text-muted-foreground mt-2 text-sm">{card.body}</p>
        </SpotlightCard>
      ))}
    </div>
  )
}

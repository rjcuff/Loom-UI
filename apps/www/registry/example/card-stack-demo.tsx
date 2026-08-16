import { CardStack, CardStackItem } from "@/registry/loomui/card-stack"

const CARDS = [
  {
    step: "01",
    title: "Cut",
    body: "Every piece is measured against the finished garment, not the bolt it came off.",
  },
  {
    step: "02",
    title: "Pin",
    body: "Nothing is sewn until the whole thing has been laid out and pinned down.",
  },
  {
    step: "03",
    title: "Sew",
    body: "One seam at a time, each one pressed flat before the next one starts.",
  },
  {
    step: "04",
    title: "Finish",
    body: "The hem, the lining, and the label. The parts nobody sees hold it together.",
  },
]

export default function CardStackDemo() {
  return (
    <div className="w-full max-w-md">
      {/* The stack measures itself against the nearest scrolling box, so it
          works in a panel like this one as well as against the page. */}
      <div className="h-72 [scrollbar-width:none] overflow-y-auto rounded-xl [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <CardStack offset={10} peek={18} tail={120}>
          {CARDS.map((card) => (
            <CardStackItem key={card.step}>
              <div className="border-border bg-card mb-4 rounded-xl border p-6 shadow-sm">
                <div className="text-muted-foreground font-mono text-xs">
                  {card.step}
                </div>
                <h3 className="mt-3 text-lg font-medium">{card.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  {card.body}
                </p>
              </div>
            </CardStackItem>
          ))}
        </CardStack>
      </div>

      <p className="text-muted-foreground mt-3 text-center text-xs">
        Scroll inside the panel.
      </p>
    </div>
  )
}

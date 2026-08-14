import { Marquee } from "@/registry/loomui/marquee"

const QUOTES = [
  "Shipped it in an afternoon.",
  "Finally, motion I can hand to a designer.",
  "The off switch is why I kept it.",
  "Reads like code I would have written.",
]

export default function MarqueeDemo() {
  return (
    <div className="relative w-full max-w-2xl overflow-hidden">
      <Marquee pauseOnHover duration={28} gap="1rem">
        {QUOTES.map((quote) => (
          <figure
            key={quote}
            className="bg-card w-64 shrink-0 rounded-xl border p-4"
          >
            <blockquote className="text-sm">{quote}</blockquote>
          </figure>
        ))}
      </Marquee>
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l to-transparent" />
    </div>
  )
}

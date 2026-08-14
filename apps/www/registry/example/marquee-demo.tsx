import { Marquee } from "@/registry/loomui/marquee"

const QUOTES = [
  "Shipped it in an afternoon.",
  "Finally, motion I can hand to a designer.",
  "The off switch is why I kept it.",
  "Reads like code I would have written.",
]

export default function MarqueeDemo() {
  return (
    <div className="w-full max-w-2xl">
      <Marquee fade pauseOnHover duration={28} gap="1rem">
        {QUOTES.map((quote) => (
          <figure
            key={quote}
            className="bg-card w-64 shrink-0 rounded-xl border p-4"
          >
            <blockquote className="text-sm">{quote}</blockquote>
          </figure>
        ))}
      </Marquee>
    </div>
  )
}

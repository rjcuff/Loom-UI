import { TestimonialWall } from "@/registry/loomui/testimonial-wall"

const QUOTES = [
  {
    name: "Ada",
    handle: "@ada",
    body: "Shipped the landing page in an afternoon.",
  },
  {
    name: "Ren",
    handle: "@ren",
    body: "Motion I can hand to a designer without a meeting.",
  },
  {
    name: "Kofi",
    handle: "@kofi",
    body: "The off switch is the reason I kept it.",
  },
  {
    name: "Mira",
    handle: "@mira",
    body: "Reads like code I would have written myself.",
  },
  {
    name: "Otto",
    handle: "@otto",
    body: "One file. No package to babysit for a year.",
  },
  {
    name: "Suki",
    handle: "@suki",
    body: "Reduced motion was already handled. Nice.",
  },
  {
    name: "Iris",
    handle: "@iris",
    body: "Every timing I wanted to change was a prop.",
  },
  {
    name: "Bo",
    handle: "@bo",
    body: "Dark mode looked right on the first try.",
  },
  {
    name: "Nell",
    handle: "@nell",
    body: "Fast enough that I stopped checking the profiler.",
  },
]

export default function TestimonialWallDemo() {
  return (
    <TestimonialWall className="h-[22rem] w-full max-w-3xl" duration={36}>
      {QUOTES.map((quote) => (
        <figure key={quote.name} className="bg-card rounded-xl border p-4">
          <blockquote className="text-sm">{quote.body}</blockquote>
          <figcaption className="text-muted-foreground mt-3 text-xs">
            {quote.name} <span className="opacity-70">{quote.handle}</span>
          </figcaption>
        </figure>
      ))}
    </TestimonialWall>
  )
}

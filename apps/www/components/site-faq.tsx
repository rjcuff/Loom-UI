import Link from "next/link"

import { siteConfig } from "@/config/site"
import { JsonLd } from "@/components/structured-data"
import { UnfoldItem, UnfoldList } from "@/registry/loomui/unfold-list"

/** Questions and their plain-text answers, which the schema below reuses. */
const FAQ = [
  {
    q: "What is loom?",
    a: "A React design system of animated components built with TypeScript and Tailwind CSS. Charts, text effects, buttons, backgrounds and device frames, each one a single file you copy into your own project.",
  },
  {
    q: "Is loom free?",
    a: "Yes. Every component is free and open source under the MIT licence, for personal and commercial work alike. There is no paid tier and no account to make.",
  },
  {
    q: "Do I need to install a package?",
    a: "No. Components are copied into your codebase as source files, so there is no runtime dependency and no package to keep up with. Once a file is yours, it only changes when you change it.",
  },
  {
    q: "Does it work with shadcn/ui?",
    a: "It is built to sit beside it. loom uses the same CLI, the same file conventions and the same design tokens, so components land in your components directory next to the ones you already have.",
  },
  {
    q: "Which frameworks are supported?",
    a: "Anything running React 19 and Tailwind CSS v4. That includes Next.js, Vite, Remix, Astro and React Router. Components that need the browser mark themselves as client components.",
  },
  {
    q: "How do I install a component?",
    a: `Run npx shadcn@latest add ${siteConfig.registry.namespace}/gauge-arc, swapping the last part for whichever component you want. The CLI writes the file and any tokens it needs.`,
  },
  {
    q: "Can I change how the animations look?",
    a: "Yes. Timings, easings, colours and counts are props, and the file is in your project, so anything a prop does not cover you edit directly. Every component also respects prefers-reduced-motion.",
  },
  {
    q: "Do the components work on mobile and with screen readers?",
    a: "Yes. Every component is responsive, keyboard operable and built against real accessibility requirements: labelled controls, visible focus, and motion that turns itself off when the reader has asked for that.",
  },
]

function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: { "@type": "Answer", text: entry.a },
    })),
  }
}

export function SiteFaq() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="border-border/60 border-t"
    >
      <JsonLd schema={faqSchema()} />

      <div className="mx-auto w-full max-w-2xl px-5 py-16 sm:py-24">
        <h2
          id="faq-heading"
          className="text-center text-[1.75rem] leading-[1.15] font-semibold tracking-tight text-balance sm:text-4xl"
        >
          Frequently asked questions
        </h2>

        <p className="text-muted-foreground mt-4 text-center text-pretty sm:text-lg">
          Everything worth knowing before you copy the first file in.
        </p>

        {/* The rows stay left aligned inside the centred column. A question and
            its answer are read left to right, and centring the text would give
            every line of every answer a different starting point. */}
        <UnfoldList type="single" className="mt-10 text-left">
          {FAQ.map((entry) => (
            <UnfoldItem key={entry.q} value={entry.q} title={entry.q}>
              {entry.a}
            </UnfoldItem>
          ))}
        </UnfoldList>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          Still stuck?{" "}
          <Link
            href={siteConfig.links.github}
            className="text-foreground underline underline-offset-4"
          >
            Open an issue on GitHub
          </Link>
          .
        </p>
      </div>
    </section>
  )
}

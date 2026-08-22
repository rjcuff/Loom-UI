"use client"

import * as React from "react"

import { BentoCard, BentoGrid } from "@/registry/loomui/bento-grid"
import { CountUp } from "@/registry/loomui/count-up"
import { LightCurtain } from "@/registry/loomui/light-curtain"
import { Marquee } from "@/registry/loomui/marquee"
import { ScrambleText } from "@/registry/loomui/scramble-text"
import { WeaveText } from "@/registry/loomui/weave-text"

/**
 * A landing section.
 *
 * Marketing pace, which is the opposite call to the dashboard block: this is
 * read once and not operated, so the entrance is allowed to take its time and
 * say something about the product. Anything a person uses all day would be
 * wrong at these durations.
 */

const LOGOS = [
  "Northwind",
  "Acme",
  "Initech",
  "Umbrella",
  "Globex",
  "Soylent",
  "Hooli",
  "Vehement",
]

const CLAIMS = [
  "Ships in an afternoon",
  "Yours the moment it lands",
  "No runtime",
]

export default function MarketingHero() {
  const [claim, setClaim] = React.useState(0)

  React.useEffect(() => {
    const timer = window.setInterval(
      () => setClaim((n) => (n + 1) % CLAIMS.length),
      3400
    )
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="bg-background min-h-svh">
      <section className="relative overflow-hidden">
        {/* Held well back from what it ships with. A wash that reads as
            ambience across a demo panel is a wall of colour across a whole
            viewport, and everything on it has to fight to stay legible. */}
        <LightCurtain intensity={0.28} reach="56%" blur={80} />

        {/* `relative` rather than pushing the curtain to `-z-10`. A negative
            index would put it behind the painted background of the wrapper
            above, which has no stacking context of its own for it to sit
            inside, and the wash would be invisible. Lifting the content is the
            version that survives being dropped into any parent. */}
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-start px-5 pt-20 pb-14 text-left sm:items-center sm:pt-28 sm:text-center">
          <span className="animate-rise border-border bg-background/90 text-muted-foreground rounded-full border px-3 py-1 text-xs backdrop-blur-sm">
            Now in public beta
          </span>

          <h1 className="animate-rise text-display mt-6 font-semibold text-balance [animation-delay:60ms] sm:text-6xl">
            Build the interface{" "}
            <WeaveText className="font-semibold">people remember</WeaveText>
          </h1>

          <p className="animate-rise text-muted-foreground mt-5 max-w-xl text-base text-pretty [animation-delay:120ms] sm:mt-6 sm:text-lg">
            Animated components in TypeScript and Tailwind CSS, copied into your
            project one file at a time.
          </p>

          {/* Each entrance lands a beat after the one above it. Everything
              arriving together reads mechanical; offset reads as a wave. */}
          <div className="animate-rise mt-8 grid w-full grid-cols-2 gap-3 [animation-delay:180ms] sm:flex sm:w-auto">
            <a
              href="#get-started"
              className="bg-primary text-primary-foreground ease-out-quart rounded-lg px-5 py-3 text-center text-sm font-medium transition-transform duration-150 active:scale-[0.97]"
            >
              Get started
            </a>
            <a
              href="#browse"
              className="border-border ease-out-quart rounded-lg border px-5 py-3 text-center text-sm font-medium transition-transform duration-150 active:scale-[0.97]"
            >
              Browse
            </a>
          </div>

          <p className="animate-rise text-muted-foreground mt-6 text-sm [animation-delay:240ms]">
            <ScrambleText key={claim} text={CLAIMS[claim]} />
          </p>
        </div>
      </section>

      {/* A band rather than a grid. Logos in a row that keeps moving read as
          "many", where a static grid of eight reads as "eight". */}
      <section
        aria-label="Trusted by"
        className="border-border/60 border-y py-6"
      >
        <Marquee duration={38} pauseOnHover gap="3rem">
          {LOGOS.map((name) => (
            <span
              key={name}
              className="text-muted-foreground text-lg font-semibold tracking-tight"
            >
              {name}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:py-20">
        <h2 className="text-2xl font-semibold text-balance sm:text-center sm:text-3xl">
          What you get
        </h2>

        <BentoGrid className="mt-8 sm:grid-cols-3">
          <BentoCard
            title="Components"
            description="Charts, text effects, buttons, backgrounds and device frames."
            className="sm:col-span-2"
          >
            <p className="mt-4 text-3xl font-semibold tabular-nums">
              <CountUp value={47} />
            </p>
          </BentoCard>

          <BentoCard
            title="Runtime dependencies"
            description="The file lands in your repo and stops being ours."
          >
            <p className="mt-4 text-3xl font-semibold tabular-nums">
              <CountUp value={0} />
            </p>
          </BentoCard>

          <BentoCard
            title="Licence"
            description="MIT, for personal and commercial work alike."
          >
            <p className="mt-4 text-3xl font-semibold">MIT</p>
          </BentoCard>

          <BentoCard
            title="One file each"
            description="Copy it in, edit it, rename it, delete it. Nothing upstream breaks."
            className="sm:col-span-2"
          />
        </BentoGrid>
      </section>
    </div>
  )
}

import { type Registry } from "shadcn/schema"

/** The house easing, repeated by any item that reaches for it directly. */
const EASE_OUT_QUART = "cubic-bezier(0.165, 0.84, 0.44, 1)"

/**
 * Blocks: whole sections rather than single pieces.
 *
 * Each one lists its components as registry dependencies, so installing a
 * block installs those too along with the tokens and keyframes they carry.
 *
 * The same rule components follow applies here. A block may only use a token
 * its own manifest ships, because it lands in someone else's project and a
 * missing token does not error, it silently falls back to an inherited value.
 * Two of these need nothing past their dependencies; `marketing-hero` declares
 * the two it reaches for.
 */
export const blocks: Registry["items"] = [
  {
    name: "analytics-dashboard",
    type: "registry:block",
    title: "Analytics Dashboard",
    description:
      "A dashboard built from loom's charts: four counted stats, a stacked trend, a source gauge and an onboarding funnel, with a range control that replays the reveal.",
    registryDependencies: [
      "@loomui/bento-grid",
      "@loomui/count-up",
      "@loomui/elastic-tabs",
      "@loomui/funnel-rows",
      "@loomui/gauge-arc",
      "@loomui/trend-stack",
    ],
    files: [
      {
        path: "blocks/analytics-dashboard.tsx",
        type: "registry:block",
      },
    ],
  },
  {
    name: "onboarding-flow",
    type: "registry:block",
    title: "Onboarding Flow",
    description:
      "A setup checklist with a progress ring, morphing tick marks, a drawer of answers, and a finish button that only celebrates once every step is done.",
    registryDependencies: [
      "@loomui/confetti-button",
      "@loomui/drawer",
      "@loomui/icon-morph",
      "@loomui/progress-ring",
      "@loomui/unfold-list",
    ],
    files: [
      {
        path: "blocks/onboarding-flow.tsx",
        type: "registry:block",
      },
    ],
  },
  {
    name: "marketing-hero",
    type: "registry:block",
    title: "Marketing Hero",
    description:
      "A landing section at marketing pace: an aurora behind a woven headline, a staggered entrance, a logo band that keeps moving, and a bento of counted facts.",
    registryDependencies: [
      "@loomui/bento-grid",
      "@loomui/count-up",
      "@loomui/light-curtain",
      "@loomui/marquee",
      "@loomui/scramble-text",
      "@loomui/weave-text",
    ],
    files: [
      {
        path: "blocks/marketing-hero.tsx",
        type: "registry:block",
      },
    ],
    // The entrance and the display step are loom's own, and nothing this block
    // installs brings them along.
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
        "animate-rise": "rise 600ms var(--ease-out-quart) both",
        "text-display": "2rem",
        "text-display--line-height": "1.1",
        "text-display--letter-spacing": "-0.022em",
      },
    },
    css: {
      "@keyframes rise": {
        from: { opacity: "0", transform: "translateY(12px)" },
        to: { opacity: "1", transform: "none" },
      },
    },
  },
]

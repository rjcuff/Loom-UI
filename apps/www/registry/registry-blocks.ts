import { type Registry } from "shadcn/schema"

/**
 * Blocks: whole sections rather than single pieces.
 *
 * Each one lists its components as registry dependencies, so installing a
 * block installs those too along with the tokens and keyframes they carry.
 *
 * The same rule components follow applies here. A block may only use a token
 * its own manifest ships, because it lands in someone else's project and a
 * missing token does not error, it silently falls back to an inherited value.
 * None of these reach past what their dependencies already bring.
 */
export const blocks: Registry["items"] = [
  {
    name: "analytics-dashboard",
    type: "registry:block",
    title: "Analytics Dashboard",
    description:
      "A dashboard built from loom's charts: four counted stats, a stacked trend, a source gauge and an onboarding funnel, with a range control that replays the reveal.",
    categories: ["dashboard"],
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
    categories: ["onboarding"],
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
    name: "login-form",
    type: "registry:block",
    title: "Login",
    description:
      "A split sign-in screen. The submit button changes shape through idle, working and done rather than swapping a label for a spinner.",
    categories: ["authentication"],
    registryDependencies: [
      "@loomui/icon-morph",
      "@loomui/light-curtain",
      "@loomui/ripple-button",
      "@loomui/spool",
      "@loomui/weave-text",
    ],
    files: [
      {
        path: "blocks/login-form.tsx",
        type: "registry:block",
      },
    ],
  },
  {
    name: "signup-form",
    type: "registry:block",
    title: "Signup",
    description:
      "A sign-up screen with a password meter driven by a spring, so each keystroke retargets the ring rather than queueing behind the last one.",
    categories: ["authentication"],
    registryDependencies: [
      "@loomui/confetti-button",
      "@loomui/icon-morph",
      "@loomui/progress-ring",
      "@loomui/unfold-list",
    ],
    files: [
      {
        path: "blocks/signup-form.tsx",
        type: "registry:block",
      },
    ],
  },
]

import { type Registry } from "shadcn/schema"

// `registryDependencies` in this file is generated from each example's imports
// by scripts/sync-example-registry-dependencies.mts. Run `pnpm
// registry-deps:fix` after changing an example's imports.
export const examples: Registry["items"] = [
  {
    name: "weave-text-demo",
    type: "registry:example",
    title: "Weave Text Demo",
    description: "Weave Text used as a headline accent.",
    registryDependencies: ["@loomui/weave-text"],
    files: [
      {
        path: "example/weave-text-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "stagger-text-demo",
    type: "registry:example",
    title: "Stagger Text Demo",
    description: "A sentence revealed word by word when it scrolls into view.",
    registryDependencies: ["@loomui/stagger-text"],
    files: [
      {
        path: "example/stagger-text-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "typewriter-demo",
    type: "registry:example",
    title: "Typewriter Demo",
    description: "A rotating list of phrases typed into a fixed-width slot.",
    registryDependencies: ["@loomui/typewriter"],
    files: [
      {
        path: "example/typewriter-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "scramble-text-demo",
    type: "registry:example",
    title: "Scramble Text Demo",
    description: "A wordmark decoding out of noise on every hover.",
    registryDependencies: ["@loomui/scramble-text"],
    files: [
      {
        path: "example/scramble-text-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "count-up-demo",
    type: "registry:example",
    title: "Count Up Demo",
    description: "Three statistics counting to their values in step.",
    registryDependencies: ["@loomui/count-up"],
    files: [
      {
        path: "example/count-up-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "lens-text-demo",
    type: "registry:example",
    title: "Lens Text Demo",
    description: "A blurred headline pulled into focus under the pointer.",
    registryDependencies: ["@loomui/lens-text"],
    files: [
      {
        path: "example/lens-text-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "grid-backdrop-demo",
    type: "registry:example",
    title: "Grid Backdrop Demo",
    description: "A grid pulsing behind a headline.",
    registryDependencies: ["@loomui/grid-backdrop"],
    files: [
      {
        path: "example/grid-backdrop-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "spotlight-card-demo",
    type: "registry:example",
    title: "Spotlight Card Demo",
    description: "Two cards lit by the pointer as it crosses them.",
    registryDependencies: ["@loomui/spotlight-card"],
    files: [
      {
        path: "example/spotlight-card-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "grid-beams-demo",
    type: "registry:example",
    title: "Grid Beams Demo",
    description: "Neon beams running down a ruled grid behind a panel of copy.",
    registryDependencies: ["@loomui/grid-beams"],
    files: [
      {
        path: "example/grid-beams-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "aurora-backdrop-demo",
    type: "registry:example",
    title: "Aurora Backdrop Demo",
    description: "A drifting colour wash behind a panel of copy.",
    registryDependencies: ["@loomui/aurora-backdrop"],
    files: [
      {
        path: "example/aurora-backdrop-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "tilt-card-demo",
    type: "registry:example",
    title: "Tilt Card Demo",
    description: "A card that leans away from the pointer with a soft sheen.",
    registryDependencies: ["@loomui/tilt-card"],
    files: [
      {
        path: "example/tilt-card-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "flip-card-demo",
    type: "registry:example",
    title: "Flip Card Demo",
    description: "A two-by-two matching game played by turning cards over.",
    registryDependencies: ["@loomui/flip-card"],
    files: [
      {
        path: "example/flip-card-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "hold-button-demo",
    type: "registry:example",
    title: "Hold Button Demo",
    description:
      "A destructive action that only goes through if you keep holding.",
    registryDependencies: ["@loomui/hold-button"],
    files: [
      {
        path: "example/hold-button-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "magnetic-demo",
    type: "registry:example",
    title: "Magnetic Demo",
    description: "A button that leans toward the pointer.",
    registryDependencies: ["@loomui/magnetic"],
    files: [
      {
        path: "example/magnetic-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "marquee-demo",
    type: "registry:example",
    title: "Marquee Demo",
    description: "A row of quote cards scrolling on a seamless loop.",
    registryDependencies: ["@loomui/marquee"],
    files: [
      {
        path: "example/marquee-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "reading-progress-demo",
    type: "registry:example",
    title: "Reading Progress Demo",
    description: "The page-level progress bar, live at the top of the screen.",
    registryDependencies: ["@loomui/reading-progress"],
    files: [
      {
        path: "example/reading-progress-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "testimonial-wall-demo",
    type: "registry:example",
    title: "Testimonial Wall Demo",
    description: "Nine quotes dealt across three columns going opposite ways.",
    registryDependencies: ["@loomui/testimonial-wall"],
    files: [
      {
        path: "example/testimonial-wall-demo.tsx",
        type: "registry:example",
      },
    ],
  },
]

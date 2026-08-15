import { type Registry } from "shadcn/schema"

/**
 * `cssVars.theme` and `css` are appended to the consumer's globals.css by the
 * shadcn CLI. Every component that references an easing token ships that token
 * itself, so a single `add` is enough. Redeclaring a token is idempotent.
 */
const EASE_OUT_QUART = "cubic-bezier(0.165, 0.84, 0.44, 1)"
const EASE_IN_OUT_CUBIC = "cubic-bezier(0.645, 0.045, 0.355, 1)"
/** Overshoots and settles back, which is what makes a turn feel thrown. */
const EASE_BACK_OUT = "cubic-bezier(0.34, 1.32, 0.52, 1)"

export const ui: Registry["items"] = [
  {
    name: "weave-text",
    type: "registry:ui",
    title: "Weave Text",
    description:
      "Text filled with a slow-drifting gradient, woven from a palette you control.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/weave-text.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "animate-weave": "weave 8s linear infinite",
      },
    },
    css: {
      "@keyframes weave": {
        from: {
          "background-position": "0% 50%",
        },
        to: {
          "background-position": "200% 50%",
        },
      },
    },
  },
  {
    name: "stagger-text",
    type: "registry:ui",
    title: "Stagger Text",
    description:
      "Words or characters that rise into place one after another, on mount or on scroll.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/stagger-text.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
        "animate-stagger-reveal":
          "stagger-reveal 500ms var(--ease-out-quart) both",
      },
    },
    css: {
      "@keyframes stagger-reveal": {
        from: {
          opacity: "0",
          transform: "translateY(0.4em)",
        },
        to: {
          opacity: "1",
          transform: "translateY(0)",
        },
      },
    },
  },
  {
    name: "typewriter",
    type: "registry:ui",
    title: "Typewriter",
    description:
      "Phrases typed out and deleted in a loop, with a caret and no layout shift.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/typewriter.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "animate-caret-blink": "caret-blink 1.1s steps(2, jump-none) infinite",
      },
    },
    css: {
      "@keyframes caret-blink": {
        "0%, 100%": {
          opacity: "1",
        },
        "50%": {
          opacity: "0",
        },
      },
    },
  },
  {
    name: "scramble-text",
    type: "registry:ui",
    title: "Scramble Text",
    description:
      "A string that resolves out of random glyphs, left to right, on mount, on scroll, or on hover.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/scramble-text.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "count-up",
    type: "registry:ui",
    title: "Count Up",
    description:
      "A number that counts to its value when it scrolls into view, without a render per frame.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/count-up.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "lens-text",
    type: "registry:ui",
    title: "Lens Text",
    description:
      "Text held out of focus until the pointer passes over it like a magnifying glass.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/lens-text.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "grid-backdrop",
    type: "registry:ui",
    title: "Grid Backdrop",
    description:
      "An SVG grid with cells that fade in and out at a deterministic, seeded scatter.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/grid-backdrop.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-in-out-cubic": EASE_IN_OUT_CUBIC,
        "animate-grid-pulse": "grid-pulse 5s var(--ease-in-out-cubic) infinite",
      },
    },
    css: {
      "@keyframes grid-pulse": {
        "0%, 100%": {
          opacity: "0",
        },
        "50%": {
          opacity: "1",
        },
      },
    },
  },
  {
    name: "spotlight-card",
    type: "registry:ui",
    title: "Spotlight Card",
    description:
      "A surface with a soft highlight that follows the pointer and fades out on leave.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/spotlight-card.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "grid-beams",
    type: "registry:ui",
    title: "Grid Beams",
    description:
      "A ruled grid with neon beams running down random lines, fading out toward the edges.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/grid-beams.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "animate-grid-beam": "grid-beam 4s linear infinite",
        "animate-grid-beam-x": "grid-beam-x 4s linear infinite",
      },
    },
    css: {
      "@keyframes grid-beam": {
        from: {
          transform: "translateY(calc(-1 * var(--beam-length, 24%)))",
        },
        to: {
          transform: "translateY(100%)",
        },
      },
      "@keyframes grid-beam-x": {
        from: {
          transform: "translateX(calc(-1 * var(--beam-length, 24%)))",
        },
        to: {
          transform: "translateX(100%)",
        },
      },
    },
  },
  {
    name: "aurora-backdrop",
    type: "registry:ui",
    title: "Aurora Backdrop",
    description:
      "A wash of blurred colour that drifts behind content on cycles that never line up.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/aurora-backdrop.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-in-out-cubic": EASE_IN_OUT_CUBIC,
        "animate-aurora-drift":
          "aurora-drift 18s var(--ease-in-out-cubic) infinite",
      },
    },
    css: {
      "@keyframes aurora-drift": {
        "0%, 100%": {
          transform: "translate(0%, 0%) scale(1)",
        },
        "33%": {
          transform: "translate(26%, -22%) scale(1.35)",
        },
        "66%": {
          transform: "translate(-24%, 18%) scale(0.75)",
        },
      },
    },
  },
  {
    name: "tilt-card",
    type: "registry:ui",
    title: "Tilt Card",
    description:
      "A surface that leans away from the pointer in 3D and settles back on leave.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/tilt-card.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "flip-card",
    type: "registry:ui",
    title: "Flip Card",
    description:
      "A card with two faces that turns in 3D when it is clicked, controlled or on its own.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/flip-card.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-back-out": EASE_BACK_OUT,
      },
    },
  },
  {
    name: "hold-button",
    type: "registry:ui",
    title: "Hold Button",
    description:
      "A button that fires only after a deliberate press and hold, with a fill sweeping across to count out the wait.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/hold-button.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "magnetic",
    type: "registry:ui",
    title: "Magnetic",
    description:
      "A wrapper that pulls its child toward the pointer as the pointer gets close.",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/magnetic.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "marquee",
    type: "registry:ui",
    title: "Marquee",
    description:
      "A seamless scrolling row or column, in either direction, that pauses on hover.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/marquee.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "animate-marquee":
          "marquee var(--marquee-duration, 40s) linear infinite",
        "animate-marquee-vertical":
          "marquee-vertical var(--marquee-duration, 40s) linear infinite",
      },
    },
    css: {
      "@keyframes marquee": {
        from: {
          transform: "translateX(0)",
        },
        to: {
          transform: "translateX(calc(-100% - var(--marquee-gap, 1rem)))",
        },
      },
      "@keyframes marquee-vertical": {
        from: {
          transform: "translateY(0)",
        },
        to: {
          transform: "translateY(calc(-100% - var(--marquee-gap, 1rem)))",
        },
      },
    },
  },
  {
    name: "reading-progress",
    type: "registry:ui",
    title: "Reading Progress",
    description:
      "A pinned bar that tracks how far through the page, or a chosen element, the reader is.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/reading-progress.tsx",
        type: "registry:ui",
      },
    ],
  },
]

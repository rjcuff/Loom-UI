import { type Registry } from "shadcn/schema"

export const lib: Registry["items"] = [
  {
    name: "utils",
    type: "registry:lib",
    title: "Utils",
    description: "The cn() class merge helper every loom component depends on.",
    dependencies: ["clsx", "tailwind-merge"],
    files: [
      {
        path: "lib/utils.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "use-spring",
    type: "registry:lib",
    title: "useSpring",
    description:
      "A spring over named numbers, driven onto a callback rather than through state, that carries velocity across every retarget.",
    files: [
      {
        path: "lib/use-spring.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "chart-frame",
    type: "registry:lib",
    title: "Chart Frame",
    description:
      "The card every loom chart sits in: label, headline, delta, the plot, and a named tile per series.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "lib/chart-frame.tsx",
        type: "registry:lib",
      },
    ],
    // The categorical series palette, validated as a set against the card
    // surface in both themes rather than flipped from one to the other.
    cssVars: {
      light: {
        "chart-1": "#ff375f",
        "chart-2": "#00c7be",
        "chart-3": "#ff9500",
        "chart-4": "#af52de",
        "chart-5": "#34c759",
        "chart-6": "#0a84ff",
        "chart-up": "oklch(0.62 0.15 145)",
        "chart-down": "oklch(0.6 0.19 25)",
      },
      dark: {
        "chart-1": "#f0526e",
        "chart-2": "#00a199",
        "chart-3": "#c06400",
        "chart-4": "#b166e0",
        "chart-5": "#00a63b",
        "chart-6": "#3b8ef0",
        "chart-up": "oklch(0.72 0.16 145)",
        "chart-down": "oklch(0.68 0.18 25)",
      },
      theme: {
        "ease-out-quart": "cubic-bezier(0.165, 0.84, 0.44, 1)",
        "color-chart-1": "var(--chart-1)",
        "color-chart-2": "var(--chart-2)",
        "color-chart-3": "var(--chart-3)",
        "color-chart-4": "var(--chart-4)",
        "color-chart-5": "var(--chart-5)",
        "color-chart-6": "var(--chart-6)",
        "color-chart-up": "var(--chart-up)",
        "color-chart-down": "var(--chart-down)",
      },
    },
  },
  {
    name: "use-in-viewport",
    type: "registry:lib",
    title: "useInViewport",
    description:
      "Tells a component whether it is on screen, so a looping animation can stop while nobody is watching it.",
    files: [
      {
        path: "lib/use-in-viewport.ts",
        type: "registry:lib",
      },
    ],
  },
]

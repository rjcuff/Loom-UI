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

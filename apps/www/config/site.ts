export const siteConfig = {
  name: "Loom UI",
  url: "https://loomui.design",
  /** Social share card in public/og.png. */
  ogImage: {
    url: "/og.png",
    width: 1200,
    height: 600,
    alt: "Loom UI",
  },
  description:
    "Beautifully animated React components and effects to make your interface feel alive.",
  tagline: "Weave motion into your interface.",
  /** Appended after a page name in the browser tab, e.g. "Weave Text | ...". */
  titleSuffix: "React Components & Effects",
  registry: {
    /** The shadcn CLI namespace users install from. */
    namespace: "@loomui",
    /** Where the generated per-item JSON is served from. */
    url: "https://loomui.design/r",
  },
  links: {
    // TODO: point this at the real repo once it exists on GitHub.
    github: "https://github.com/rjcuff/Loom-UI",
    twitter: "https://x.com/ryancuff_",
  },
  keywords: [
    "React components",
    "animated components",
    "Tailwind CSS",
    "TypeScript",
    "Motion",
    "shadcn/ui",
    "Next.js",
    "UI library",
    "landing page components",
  ],
  author: {
    name: "Ryan",
    url: "https://x.com/ryancuff_",
  },
}

export type SiteConfig = typeof siteConfig

/** Builds a consistent tab title: "Weave Text | React Components & Effects" */
export function pageTitle(name: string) {
  return `${name} | ${siteConfig.titleSuffix}`
}

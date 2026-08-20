export const siteConfig = {
  name: "Loom UI",
  url: "https://loomui.design",
  /** Social share card in public/og.png. */
  ogImage: {
    url: "/og.png",
    width: 1731,
    height: 909,
    alt: "Loom UI",
  },
  /**
   * The search snippet, so it leads with what someone is searching for
   * (animated React components) and what it costs them (nothing). Kept under
   * 160 characters, which is roughly where Google starts truncating.
   */
  description:
    "Free, open-source animated React components built with TypeScript, Tailwind CSS and Motion. Copy any one into your project. No runtime, no dependency to track.",
  tagline: "Weave motion into your interface.",
  /**
   * The home page title. A bare brand name earns nothing in search results, so
   * the one page competing for generic queries says what it is as well.
   */
  seoTitle: "Loom UI | Animated React Components for Tailwind CSS",
  /** Appended after a page name in the browser tab, e.g. "Weave Text | ...". */
  titleSuffix: "React Components & Effects",
  registry: {
    /** The shadcn CLI namespace users install from. */
    namespace: "@loomui",
    /** Where the generated per-item JSON is served from. */
    url: "https://loomui.design/r",
  },
  links: {
    // Also baked into public/llms.txt. Run `pnpm build:registry` after
    // changing anything in this object that the generator reads.
    github: "https://github.com/rjcuff/Loom-UI",
    twitter: "https://x.com/ryancuff_",
  },
  keywords: [
    "React components",
    "animated components",
    "React animation library",
    "copy paste React components",
    "Tailwind CSS",
    "TypeScript",
    "Motion",
    "Framer Motion components",
    "shadcn/ui",
    "shadcn registry",
    "Next.js",
    "UI library",
    "free UI components",
    "open source component library",
    "landing page components",
  ],
  author: {
    name: "Ryan",
    url: "https://x.com/ryancuff_",
  },
}

export type SiteConfig = typeof siteConfig

export interface Announcement {
  /** The line itself. Keep it to one short clause. It has to fit on a phone. */
  text: string
  href: string
}

/** The strip above the header. Set to `null` to take it down. */
export const announcement: Announcement | null = null

/** Builds a consistent tab title: "Weave Text | React Components & Effects" */
export function pageTitle(name: string) {
  return `${name} | ${siteConfig.titleSuffix}`
}

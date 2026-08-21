export const siteConfig = {
  name: "Loom UI",
  url: "https://loomui.design",
  /** Social share card in public/og.png. */
  ogImage: {
    url: "/og.png",
    width: 1731,
    height: 909,
    alt: "Loom UI — an animated React design system for Tailwind CSS",
  },
  /**
   * The search snippet. Leads with what this is (a design system), then the
   * two things a reader is deciding on: what it costs and what it drags in.
   * Kept under 160 characters, which is roughly where Google truncates.
   */
  description:
    "A free, open-source React design system of animated components in TypeScript and Tailwind CSS. Copy each one into your project. No runtime, nothing to track.",
  tagline: "Weave motion into your interface.",
  /**
   * The home page title. A bare brand name earns nothing in search results, so
   * the one page competing for generic queries says what it is as well.
   * "Animated React design system" is the niche worth owning: broad enough to
   * be searched, narrow enough to rank against the general-purpose libraries.
   */
  seoTitle: "Loom UI | Animated React Design System for Tailwind CSS",
  /**
   * Appended after a page name in the browser tab, e.g. "Weave Text | ...".
   * Carries the brand and the primary term across all forty-odd doc pages,
   * which is most of the site's crawlable surface.
   */
  titleSuffix: "Loom UI React Design System",
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
  /**
   * Google has ignored this tag since 2009. It is here for the crawlers that
   * do not: AI answer engines and a handful of smaller indexes. Ordered by
   * what the site should be found for, and kept honest — a term here that the
   * page does not deliver on buys a visit that bounces.
   */
  keywords: [
    "React design system",
    "animated React design system",
    "Tailwind CSS design system",
    "shadcn design system",
    "React component library",
    "animated React components",
    "React animation library",
    "copy paste React components",
    "shadcn/ui",
    "shadcn registry",
    "Tailwind CSS",
    "TypeScript",
    "Next.js",
    "free UI components",
    "open source design system",
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

import type { NavBadge, NavItem, NavItemWithChildren } from "@/types"

interface DocsConfig {
  mainNav: NavItem[]
  sidebarNav: NavItemWithChildren[]
}

export interface DocNavLink {
  url: string
  name: string
}

/**
 * The sidebar is authored by hand rather than derived from the file tree so
 * that ordering is explicit and prev/next follows reading order, not
 * alphabetical order.
 */
/** Where `/docs` sends people, since there is no docs landing page. */
export const DOCS_ENTRY = "/docs/components"

export const docsConfig: DocsConfig = {
  mainNav: [
    { title: "Components", href: DOCS_ENTRY },
    { title: "Blocks", href: "/blocks" },
    { title: "Installation", href: "/docs/installation" },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        { title: "Introduction", href: "/docs/introduction" },
        { title: "Installation", href: "/docs/installation" },
        { title: "Theming", href: "/docs/theming" },
        { title: "Blocks", href: "/blocks" },
        { title: "All Components", href: DOCS_ENTRY },
      ],
    },
    {
      title: "Interface",
      items: [
        {
          title: "Drawer",
          href: "/docs/components/drawer",
        },
        {
          title: "Shake Field",
          href: "/docs/components/shake-field",
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Spool",
          href: "/docs/components/spool",
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Photo Stamp",
          href: "/docs/components/photo-stamp",
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Icon Morph",
          href: "/docs/components/icon-morph",
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Progress Ring",
          href: "/docs/components/progress-ring",
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Elastic Tabs",
          href: "/docs/components/elastic-tabs",
        },
        {
          title: "Unfold List",
          href: "/docs/components/unfold-list",
        },
        {
          title: "Loom Slider",
          href: "/docs/components/loom-slider",
        },
        {
          title: "Compare Slider",
          href: "/docs/components/compare-slider",
        },
        {
          title: "Loom Loader",
          href: "/docs/components/loom-loader",
        },
        {
          title: "Shimmer Skeleton",
          href: "/docs/components/shimmer-skeleton",
        },
        {
          title: "Reading Progress",
          href: "/docs/components/reading-progress",
        },
        {
          title: "Bento Grid",
          href: "/docs/components/bento-grid",
        },
        {
          title: "Card Stack",
          href: "/docs/components/card-stack",
        },
        {
          title: "Marquee",
          href: "/docs/components/marquee",
        },
        {
          title: "Testimonial Wall",
          href: "/docs/components/testimonial-wall",
        },
        {
          title: "Terminal",
          href: "/docs/components/terminal",
        },
        {
          title: "Thread Timeline",
          href: "/docs/components/thread-timeline",
        },
        {
          title: "Ticket Stub",
          href: "/docs/components/ticket-stub",
        },
        {
          title: "Logo Loom",
          href: "/docs/components/logo-loom",
        },
      ],
    },
    {
      title: "Charts",
      badge: { text: "New", variant: "new" },
      items: [
        {
          title: "Trend Stack",
          href: "/docs/components/trend-stack",
        },
        {
          title: "Funnel Rows",
          href: "/docs/components/funnel-rows",
        },
        {
          title: "Gauge Arc",
          href: "/docs/components/gauge-arc",
        },
      ],
    },
    {
      title: "Text",
      items: [
        {
          title: "Weave Text",
          href: "/docs/components/weave-text",
        },
        {
          title: "Stagger Text",
          href: "/docs/components/stagger-text",
        },
        {
          title: "Typewriter",
          href: "/docs/components/typewriter",
        },
        {
          title: "Scramble Text",
          href: "/docs/components/scramble-text",
        },
        {
          title: "Lens Text",
          href: "/docs/components/lens-text",
        },
        {
          title: "Split Flap",
          href: "/docs/components/split-flap",
        },
        {
          title: "Count Up",
          href: "/docs/components/count-up",
        },
      ],
    },
    {
      title: "Effects",
      items: [
        {
          title: "Magnetic",
          href: "/docs/components/magnetic",
        },
        {
          title: "Image Trail",
          href: "/docs/components/image-trail",
        },
        {
          title: "Sticker Peel",
          href: "/docs/components/sticker-peel",
        },
        {
          title: "Tilt Card",
          href: "/docs/components/tilt-card",
        },
        {
          title: "Spotlight Card",
          href: "/docs/components/spotlight-card",
        },
        {
          title: "Flip Card",
          href: "/docs/components/flip-card",
        },
      ],
    },
    {
      title: "Buttons",
      items: [
        {
          title: "Hold Button",
          href: "/docs/components/hold-button",
        },
        {
          title: "Ripple Button",
          href: "/docs/components/ripple-button",
        },
        {
          title: "Confetti Button",
          href: "/docs/components/confetti-button",
        },
      ],
    },
    {
      title: "Backgrounds",
      items: [
        {
          title: "Aurora Backdrop",
          href: "/docs/components/aurora-backdrop",
        },
        {
          title: "Light Curtain",
          href: "/docs/components/light-curtain",
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Grid Beams",
          href: "/docs/components/grid-beams",
        },
        {
          title: "Grid Backdrop",
          href: "/docs/components/grid-backdrop",
        },
        {
          title: "Stitch Path",
          href: "/docs/components/stitch-path",
        },
      ],
    },
    {
      title: "Mockups",
      items: [
        {
          title: "iPhone",
          href: "/docs/components/iphone",
        },
        {
          title: "iPad",
          href: "/docs/components/ipad",
        },
        {
          title: "MacBook",
          href: "/docs/components/macbook",
        },
      ],
    },
  ],
}

function flattenSidebarItems(
  items: NavItemWithChildren[],
  acc: DocNavLink[] = []
): DocNavLink[] {
  for (const item of items) {
    if (item.href && !item.external) {
      acc.push({ url: item.href, name: item.title })
    }
    if (item.items?.length) {
      flattenSidebarItems(item.items, acc)
    }
  }
  return acc
}

function getFlattenedDocsNav(): DocNavLink[] {
  const result: DocNavLink[] = []
  for (const section of docsConfig.sidebarNav) {
    if (section.items?.length) {
      flattenSidebarItems(section.items, result)
    }
  }
  return result
}

function normalize(url: string) {
  return url.replace(/\/$/, "") || "/"
}

/**
 * Badges live in the sidebar config so there is one place to mark a component
 * "New". The components index reads them back out by href.
 */
export function getNavBadge(url: string): NavBadge | undefined {
  const target = normalize(url)

  for (const section of docsConfig.sidebarNav) {
    for (const item of section.items ?? []) {
      if (item.href && normalize(item.href) === target) {
        return item.badge
      }
    }
  }

  return undefined
}

export function getNeighboursFromConfig(currentUrl: string): {
  previous?: DocNavLink
  next?: DocNavLink
} {
  const nav = getFlattenedDocsNav()
  const target = normalize(currentUrl)
  const index = nav.findIndex((item) => normalize(item.url) === target)

  if (index < 0) {
    return {}
  }

  return {
    previous: index > 0 ? nav[index - 1] : undefined,
    next: index < nav.length - 1 ? nav[index + 1] : undefined,
  }
}

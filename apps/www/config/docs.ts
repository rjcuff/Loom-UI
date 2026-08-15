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
    { title: "Installation", href: "/docs/installation" },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        { title: "Installation", href: "/docs/installation" },
        { title: "All Components", href: DOCS_ENTRY },
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
          title: "Count Up",
          href: "/docs/components/count-up",
        },
        {
          title: "Lens Text",
          href: "/docs/components/lens-text",
          badge: { text: "New", variant: "new" },
        },
      ],
    },
    {
      title: "Backgrounds",
      items: [
        {
          title: "Grid Backdrop",
          href: "/docs/components/grid-backdrop",
        },
        {
          title: "Spotlight Card",
          href: "/docs/components/spotlight-card",
        },
        {
          title: "Grid Beams",
          href: "/docs/components/grid-beams",
        },
        {
          title: "Aurora Backdrop",
          href: "/docs/components/aurora-backdrop",
        },
      ],
    },
    {
      title: "Interaction",
      items: [
        {
          title: "Tilt Card",
          href: "/docs/components/tilt-card",
        },
        {
          title: "Flip Card",
          href: "/docs/components/flip-card",
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Hold Button",
          href: "/docs/components/hold-button",
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Magnetic",
          href: "/docs/components/magnetic",
        },
        {
          title: "Marquee",
          href: "/docs/components/marquee",
        },
        {
          title: "Reading Progress",
          href: "/docs/components/reading-progress",
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

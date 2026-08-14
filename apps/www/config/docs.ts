import type { NavItem, NavItemWithChildren } from "@/types"

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
export const DOCS_ENTRY = "/docs/components/weave-text"

export const docsConfig: DocsConfig = {
  mainNav: [
    { title: "Components", href: DOCS_ENTRY },
    { title: "Installation", href: "/docs/installation" },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [{ title: "Installation", href: "/docs/installation" }],
    },
    {
      title: "Text",
      items: [
        {
          title: "Weave Text",
          href: "/docs/components/weave-text",
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Stagger Text",
          href: "/docs/components/stagger-text",
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Typewriter",
          href: "/docs/components/typewriter",
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Count Up",
          href: "/docs/components/count-up",
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
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Spotlight Card",
          href: "/docs/components/spotlight-card",
          badge: { text: "New", variant: "new" },
        },
      ],
    },
    {
      title: "Interaction",
      items: [
        {
          title: "Magnetic",
          href: "/docs/components/magnetic",
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Marquee",
          href: "/docs/components/marquee",
          badge: { text: "New", variant: "new" },
        },
        {
          title: "Reading Progress",
          href: "/docs/components/reading-progress",
          badge: { text: "New", variant: "new" },
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

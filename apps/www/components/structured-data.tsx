import { siteConfig } from "@/config/site"
import { absoluteUrl } from "@/lib/utils"

type Schema = Record<string, unknown>

/**
 * A JSON-LD block. Search engines read the graph rather than guessing what the
 * page is from its markup, which is what puts a name, a licence and a price of
 * zero into the result rather than a bare blue link.
 */
export function JsonLd({ schema }: { schema: Schema }) {
  return (
    <script
      type="application/ld+json"
      // The payload is authored here, not user input, but `<` is escaped all
      // the same so no string in it can close the script tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  )
}

/** Stable @ids, so the nodes below can point at each other instead of repeating. */
const SITE_ID = `${siteConfig.url}/#website`
const AUTHOR_ID = `${siteConfig.url}/#author`
const SOFTWARE_ID = `${siteConfig.url}/#software`

/**
 * The site itself: who made it, what it is, and that it is free. Rendered once,
 * on the home page, since every other page references these @ids.
 */
export function siteSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": AUTHOR_ID,
        name: siteConfig.author.name,
        url: siteConfig.author.url,
        sameAs: [siteConfig.links.twitter, siteConfig.links.github],
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: "en-US",
        author: { "@id": AUTHOR_ID },
        publisher: { "@id": AUTHOR_ID },
      },
      {
        "@type": "SoftwareApplication",
        "@id": SOFTWARE_ID,
        name: siteConfig.name,
        url: siteConfig.url,
        applicationCategory: "DeveloperApplication",
        // Says what kind of developer tool this is rather than leaving it at
        // the top-level category every npm package also claims.
        applicationSubCategory: "Design System",
        alternateName: "loom",
        operatingSystem: "Any",
        description: siteConfig.description,
        // What a result can list underneath the name. Written as capabilities,
        // not marketing: each one is something the library actually ships.
        featureList: [
          "Animated React components",
          "Charts and data visualisation",
          "Text and typography effects",
          "Backgrounds and device frames",
          "Copy-paste source, no runtime dependency",
          "Light and dark themes",
          "Reduced-motion support",
        ],
        author: { "@id": AUTHOR_ID },
        license: "https://opensource.org/licenses/MIT",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        keywords: siteConfig.keywords.join(", "),
        softwareRequirements: "React 19, Tailwind CSS v4",
        codeRepository: siteConfig.links.github,
      },
    ],
  }
}

export interface Crumb {
  name: string
  url: string
}

/**
 * A documentation page: the article plus the trail that leads to it, which is
 * what turns a result into "loomui.design › Docs › Components › Weave Text".
 */
export function docSchema({
  title,
  description,
  url,
  crumbs,
}: {
  title: string
  description: string
  url: string
  crumbs: Crumb[]
}): Schema {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: title,
        description,
        url: absoluteUrl(url),
        mainEntityOfPage: absoluteUrl(url),
        inLanguage: "en-US",
        author: { "@id": AUTHOR_ID },
        publisher: { "@id": AUTHOR_ID },
        isPartOf: { "@id": SITE_ID },
        about: { "@id": SOFTWARE_ID },
        proficiencyLevel: "Beginner",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: absoluteUrl(crumb.url),
        })),
      },
    ],
  }
}

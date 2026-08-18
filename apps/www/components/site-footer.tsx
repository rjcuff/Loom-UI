import { siteConfig } from "@/config/site"

export function SiteFooter() {
  return (
    <footer className="border-border border-t">
      <p className="text-muted-foreground mx-auto w-full max-w-5xl px-5 py-8 text-center text-sm text-balance">
        Built by{" "}
        <a
          href={siteConfig.links.twitter}
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground underline underline-offset-4 transition-colors duration-150"
        >
          ryan
        </a>
        . Source code on{" "}
        <a
          href={siteConfig.links.github}
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground underline underline-offset-4 transition-colors duration-150"
        >
          GitHub
        </a>
        .
      </p>
    </footer>
  )
}

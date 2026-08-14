import type { TOCItemType } from "fumadocs-core/server"

import { cn } from "@/lib/utils"

export function DocsTableOfContents({ toc }: { toc: TOCItemType[] }) {
  if (toc.length === 0) {
    return null
  }

  return (
    <nav aria-labelledby="on-this-page" className="flex flex-col gap-2 text-sm">
      <p id="on-this-page" className="font-medium">
        On this page
      </p>
      <ul className="border-border flex flex-col gap-1.5 border-l">
        {toc.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              className={cn(
                "text-muted-foreground hover:border-accent hover:text-foreground -ml-px block border-l border-transparent pl-3 transition-colors",
                item.depth >= 3 && "pl-6"
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

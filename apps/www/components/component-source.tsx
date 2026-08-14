import fs from "node:fs/promises"
import path from "node:path"
import * as React from "react"

import { highlightCode } from "@/lib/highlight-code"
import { getRegistryItem } from "@/lib/registry"
import { cn } from "@/lib/utils"
import { CodeCollapsibleWrapper } from "@/components/code-collapsible-wrapper"
import { CopyButton } from "@/components/copy-button"

interface ComponentSourceProps {
  /** A registry item name. Reads the item's first file. */
  name?: string
  /** Or a path relative to apps/www, for one-off files. */
  src?: string
  language?: string
  title?: string
  collapsible?: boolean
  className?: string
}

export async function ComponentSource({
  name,
  src,
  language,
  title,
  collapsible = true,
  className,
}: ComponentSourceProps) {
  if (!name && !src) {
    return null
  }

  let code: string | undefined

  if (name) {
    const item = await getRegistryItem(name)
    code = item?.files?.[0]?.content
  } else if (src) {
    code = await fs.readFile(path.join(process.cwd(), src), "utf-8")
  }

  if (!code) {
    return (
      <p className="text-muted-foreground text-sm">
        No source found for <code className="font-mono">{name ?? src}</code>.
      </p>
    )
  }

  // Show the path the file will live at in the consumer's project, not ours.
  const resolvedTitle = title ?? (name ? `components/ui/${name}.tsx` : src)
  const lang = language ?? resolvedTitle?.split(".").pop() ?? "tsx"
  const highlighted = await highlightCode(code, lang)

  const block = (
    <CodeBlock
      code={code}
      html={highlighted}
      language={lang}
      title={resolvedTitle}
    />
  )

  if (!collapsible) {
    return <div className={className}>{block}</div>
  }

  return (
    <CodeCollapsibleWrapper className={className}>
      {block}
    </CodeCollapsibleWrapper>
  )
}

function CodeBlock({
  code,
  html,
  language,
  title,
}: {
  code: string
  html: string
  language: string
  title?: string
}) {
  return (
    <figure
      data-rehype-pretty-code-figure=""
      className={cn("group relative h-full")}
    >
      {title ? (
        <figcaption data-rehype-pretty-code-title="" data-language={language}>
          {title}
        </figcaption>
      ) : null}
      {/* With a title bar there is a header to sit in; without one the button
          falls back to hovering over the first line of code. */}
      <CopyButton value={code} className={cn(title && "top-1")} />
      <div dangerouslySetInnerHTML={{ __html: html }} className="h-full" />
    </figure>
  )
}

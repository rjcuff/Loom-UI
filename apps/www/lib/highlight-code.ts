import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers"
import { codeToHtml } from "shiki"

/**
 * Shared between MDX code fences (via rehype-pretty-code in source.config.ts)
 * and the on-the-fly highlighting used by <ComponentSource />, so both render
 * identically.
 */
const MATCH = { matchAlgorithm: "v3" } as const

export const transformers = [
  transformerNotationDiff(MATCH),
  transformerNotationFocus(MATCH),
  transformerNotationHighlight(MATCH),
  transformerNotationWordHighlight(MATCH),
]

/**
 * rehype-pretty-code tags every line with `data-line`, and the code block CSS
 * hangs its gutters off that attribute. Raw shiki only emits `class="line"`, so
 * without this the on-the-fly blocks render with no horizontal padding.
 */
const lineAttribute = {
  name: "line-attribute",
  line(node: { properties: Record<string, unknown> }) {
    node.properties["data-line"] = ""
  },
}

const THEMES = {
  light: "github-light-default",
  dark: "github-dark",
} as const

export async function highlightCode(code: string, language = "tsx") {
  const html = await codeToHtml(code.trimEnd(), {
    lang: language,
    themes: THEMES,
    // Emit --shiki-light / --shiki-dark vars instead of hardcoded colors so
    // theme switching is pure CSS. See styles/globals.css.
    defaultColor: false,
    transformers: [...transformers, lineAttribute],
  })

  return html
}

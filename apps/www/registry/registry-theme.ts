import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { type Registry } from "shadcn/schema"

/**
 * The whole token layer, as one installable item.
 *
 * Read out of `styles/globals.css` at build time rather than written here by
 * hand. A second copy of every token is a second copy to keep in step, and the
 * one that drifts is always the one nobody is looking at.
 *
 * `:root` and `.dark` become the `light` and `dark` groups, which the CLI
 * writes as custom properties. The `@theme` blocks become the `theme` group,
 * which is what Tailwind turns into utility names.
 */

const here = path.dirname(fileURLToPath(import.meta.url))
const cssPath = path.join(here, "..", "styles", "globals.css")

type Vars = Record<string, string>

/** Pulls the body out of every block opened by `selector`. */
function blocks(css: string, selector: string) {
  const found: string[] = []
  const opener = new RegExp(`(^|\\n)\\s*${selector}\\s*\\{`, "g")

  let match: RegExpExecArray | null
  while ((match = opener.exec(css))) {
    let depth = 0
    let index = match.index + match[0].length - 1
    const start = index + 1

    for (; index < css.length; index += 1) {
      if (css[index] === "{") depth += 1
      else if (css[index] === "}") {
        depth -= 1
        if (depth === 0) break
      }
    }
    found.push(css.slice(start, index))
  }

  return found
}

/** Every `--name: value;` declaration in a chunk of CSS, comments skipped. */
function declarations(source: string): Vars {
  const out: Vars = {}
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "")
  const declaration = /--([a-z0-9-]+(?:--[a-z-]+)?)\s*:\s*([^;]+);/gi

  let match: RegExpExecArray | null
  while ((match = declaration.exec(withoutComments))) {
    out[match[1]] = match[2].replace(/\s+/g, " ").trim()
  }

  return out
}

export async function buildThemeItem(): Promise<Registry["items"][number]> {
  const css = await fs.readFile(cssPath, "utf8")

  const light: Vars = {}
  const dark: Vars = {}
  const theme: Vars = {}

  for (const body of blocks(css, ":root"))
    Object.assign(light, declarations(body))
  for (const body of blocks(css, "\\.dark"))
    Object.assign(dark, declarations(body))

  // `@theme inline` only re-exports what `:root` already declares, so it would
  // add a wall of `--color-x: var(--x)` that says nothing. Only the plain
  // `@theme` blocks carry values of their own.
  for (const body of blocks(css, "@theme")) {
    const vars = declarations(body)
    for (const [name, value] of Object.entries(vars)) {
      if (value.startsWith("var(--")) continue
      theme[name] = value
    }
  }

  return {
    name: "theme",
    type: "registry:theme",
    title: "loom design tokens",
    description:
      "The whole token layer: colour for both themes, the type scale with its paired line height and letter spacing, elevation, blur, the stacking scale, durations and easing curves. Install this for loom's design system without any particular component.",
    cssVars: { light, dark, theme },
  }
}

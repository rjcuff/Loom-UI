import { registryIndexSchema, type Registry } from "shadcn/schema"

// Relative imports (not the `@/` alias) so the build script can load this
// module directly under tsx without alias resolution.
import { blocks } from "./registry-blocks"
import { examples } from "./registry-examples"
import { lib } from "./registry-lib"
import { buildThemeItem } from "./registry-theme"
import { ui } from "./registry-ui"

/** Names kept in the manifests for URL stability but hidden from the build. */
const DEPRECATED_ITEMS: string[] = []

/**
 * The theme item is read out of globals.css at build time, so the registry is
 * assembled rather than declared. Everything that consumes it awaits this.
 */
export async function buildRegistry(): Promise<Registry> {
  const theme = await buildThemeItem()

  return {
    name: "loomui",
    homepage: "https://loomui.design",
    items: registryIndexSchema.parse(
      [theme, ...blocks, ...ui, ...examples, ...lib].filter(
        (item) => !DEPRECATED_ITEMS.includes(item.name)
      )
    ),
  } satisfies Registry
}

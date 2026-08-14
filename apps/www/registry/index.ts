import { registryIndexSchema, type Registry } from "shadcn/schema"

// Relative imports (not the `@/` alias) so the build script can load this
// module directly under tsx without alias resolution.
import { examples } from "./registry-examples"
import { lib } from "./registry-lib"
import { ui } from "./registry-ui"

/** Names kept in the manifests for URL stability but hidden from the build. */
const DEPRECATED_ITEMS: string[] = []

export const registry = {
  name: "loomui",
  homepage: "https://loomui.design",
  items: registryIndexSchema.parse(
    [...ui, ...examples, ...lib].filter(
      (item) => !DEPRECATED_ITEMS.includes(item.name)
    )
  ),
} satisfies Registry

import fs from "node:fs/promises"
import path from "node:path"
import { cache } from "react"
import { registryItemSchema, type RegistryItem } from "shadcn/schema"

import { Index } from "@/registry/__index__"

type RegistryItemType = RegistryItem["type"]

interface RegistryFile {
  path: string
  type?: RegistryItemType
  target?: string
}

interface RegistryFileWithContent extends RegistryFile {
  content: string
}

/**
 * Where each kind of registry file lands in a consumer's project. Mirrors the
 * shadcn CLI defaults so the docs show the same paths the CLI writes.
 */
const TARGET_BY_TYPE: Partial<Record<string, string>> = {
  "registry:ui": "components/ui",
  "registry:component": "components",
  "registry:example": "components",
  "registry:hook": "hooks",
  "registry:lib": "lib",
}

/**
 * Inside this repo components import each other through `@/registry/...`.
 * Published snippets must use the aliases a consumer actually has.
 */
const REGISTRY_IMPORT =
  /@\/registry\/(?:[\w-]+\/)*?(ui|components|hooks|lib|loomui)\/([\w-]+)/g

export function fixImport(content: string) {
  return content.replace(
    REGISTRY_IMPORT,
    (match, segment: string, name: string) => {
      switch (segment) {
        // `loomui` is our source folder for shipped components; consumers get
        // them under components/ui.
        case "loomui":
        case "ui":
          return `@/components/ui/${name}`
        case "components":
          return `@/components/${name}`
        case "hooks":
          return `@/hooks/${name}`
        case "lib":
          return `@/lib/${name}`
        default:
          return match
      }
    }
  )
}

/** The React.lazy wrapper generated into __index__.tsx, for live previews. */
export function getRegistryComponent(name: string) {
  return Index[name]?.component
}

function resolveTarget(file: RegistryFile) {
  if (file.target) {
    return file.target
  }

  const dir = file.type ? TARGET_BY_TYPE[file.type] : undefined
  return dir ? `${dir}/${path.basename(file.path)}` : ""
}

const readSource = cache(async (filePath: string, type?: RegistryItemType) => {
  let code = await fs.readFile(filePath, "utf-8")

  // Demos use a default export so the preview can render them generically,
  // but published snippets should always be named exports.
  if (type !== "registry:page") {
    code = code.replaceAll("export default", "export")
  }

  return fixImport(code)
})

const readRegistryItem = cache(async (name: string) => {
  const entry = Index[name]

  if (!entry) {
    return null
  }

  const parsedEntry = registryItemSchema.safeParse(entry)

  if (!parsedEntry.success) {
    console.error(`Invalid registry item "${name}":`, parsedEntry.error.message)
    return null
  }

  // __index__.tsx stores repo-relative paths; resolve them against the app
  // root (which is the cwd for both `next dev` and `next build`).
  const files: RegistryFileWithContent[] = await Promise.all(
    (parsedEntry.data.files ?? []).map(async (file) => ({
      ...file,
      target: resolveTarget(file),
      content: await readSource(path.join(process.cwd(), file.path), file.type),
    }))
  )

  const parsed = registryItemSchema.safeParse({ ...parsedEntry.data, files })

  if (!parsed.success) {
    console.error(`Invalid registry item "${name}":`, parsed.error.message)
    return null
  }

  return parsed.data
})

export async function getRegistryItem(name: string) {
  return readRegistryItem(name)
}

/** `npx shadcn@latest add @loomui/weave-text` */
export function getInstallCommand(name: string, namespace = "@loomui") {
  return `npx shadcn@latest add ${namespace}/${name}`
}

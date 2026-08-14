/**
 * Keeps `registryDependencies` in registry-examples.ts honest.
 *
 * Every demo under registry/example imports the components it shows. Those
 * imports are the source of truth: this script reads them with ts-morph and
 * either reports drift (--check, used in CI) or rewrites the manifest (--fix,
 * run automatically before every registry build).
 */
import { promises as fs } from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"
import { Project, SyntaxKind, type ObjectLiteralExpression } from "ts-morph"

const NAMESPACE = "@loomui"
const UI_IMPORT_PREFIX = "@/registry/loomui/"
const EXAMPLE_IMPORT_PREFIX = "@/registry/example/"

const scriptPath = fileURLToPath(import.meta.url)
const appRoot = path.resolve(path.dirname(scriptPath), "..")
const registryRoot = path.join(appRoot, "registry")
const examplesManifestPath = path.join(registryRoot, "registry-examples.ts")

export type SyncMode = "check" | "fix"

export interface ExampleIssue {
  exampleName: string
  missingFiles: string[]
  missingDependencies: string[]
  extraDependencies: string[]
}

function getStringLiteral(node: import("ts-morph").Node | undefined) {
  if (!node) return null
  const literal =
    node.asKind(SyntaxKind.StringLiteral) ??
    node.asKind(SyntaxKind.NoSubstitutionTemplateLiteral)
  return literal ? literal.getLiteralText() : null
}

function getProperty(obj: ObjectLiteralExpression, name: string) {
  return obj.getProperty(name)?.asKind(SyntaxKind.PropertyAssignment)
}

function readName(obj: ObjectLiteralExpression) {
  return getStringLiteral(getProperty(obj, "name")?.getInitializer())
}

/** Relative-to-registry paths declared by a manifest entry. */
function readFilePaths(obj: ObjectLiteralExpression) {
  const files = getProperty(obj, "files")
    ?.getInitializer()
    ?.asKind(SyntaxKind.ArrayLiteralExpression)

  if (!files) return []

  return files
    .getElements()
    .map((element) => {
      const literal = getStringLiteral(element)
      if (literal) return literal

      const entry = element.asKind(SyntaxKind.ObjectLiteralExpression)
      return entry ? getStringLiteral(getProperty(entry, "path")?.getInitializer()) : null
    })
    .filter((value): value is string => Boolean(value))
}

function readDeclaredDependencies(obj: ObjectLiteralExpression) {
  const deps = getProperty(obj, "registryDependencies")
    ?.getInitializer()
    ?.asKind(SyntaxKind.ArrayLiteralExpression)

  if (!deps) return []

  return deps
    .getElements()
    .map((element) => getStringLiteral(element))
    .filter((value): value is string => Boolean(value))
}

/**
 * `@/registry/loomui/aurora-text` -> `@loomui/aurora-text`
 * `@/registry/example/other-demo` -> `other-demo`
 */
function importToRegistryDependency(specifier: string) {
  if (specifier.startsWith(UI_IMPORT_PREFIX)) {
    return `${NAMESPACE}/${specifier.slice(UI_IMPORT_PREFIX.length)}`
  }
  if (specifier.startsWith(EXAMPLE_IMPORT_PREFIX)) {
    return specifier.slice(EXAMPLE_IMPORT_PREFIX.length)
  }
  return null
}

function writeDependencies(obj: ObjectLiteralExpression, deps: string[]) {
  const existing = getProperty(obj, "registryDependencies")

  if (deps.length === 0) {
    existing?.remove()
    return
  }

  const initializer = `[${deps.map((dep) => `"${dep}"`).join(", ")}]`

  if (existing) {
    existing.setInitializer(initializer)
    return
  }

  // Keep the property above `files`, which is where it reads best.
  const filesIndex = obj
    .getProperties()
    .findIndex((property) => property.asKind(SyntaxKind.PropertyAssignment)?.getName() === "files")

  obj.insertPropertyAssignment(filesIndex < 0 ? obj.getProperties().length : filesIndex, {
    name: "registryDependencies",
    initializer,
  })
}

export async function syncExampleRegistryDependencies({
  mode,
}: {
  mode: SyncMode
}): Promise<ExampleIssue[]> {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { allowJs: true },
  })

  const manifest = project.addSourceFileAtPath(examplesManifestPath)
  const examples = manifest
    .getVariableDeclarationOrThrow("examples")
    .getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression)

  const issues: ExampleIssue[] = []
  let changed = false

  for (const element of examples.getElements()) {
    const entry = element.asKind(SyntaxKind.ObjectLiteralExpression)
    if (!entry) continue

    const exampleName = readName(entry)
    if (!exampleName) continue

    const filePaths = readFilePaths(entry)
    const missingFiles: string[] = []
    const resolved = new Set<string>()

    for (const filePath of filePaths) {
      const absolute = path.join(registryRoot, filePath)

      try {
        await fs.access(absolute)
      } catch {
        missingFiles.push(filePath)
        continue
      }

      const source = project.addSourceFileAtPath(absolute)

      for (const declaration of source.getImportDeclarations()) {
        const dependency = importToRegistryDependency(
          declaration.getModuleSpecifierValue()
        )
        if (dependency) {
          resolved.add(dependency)
        }
      }
    }

    const expected = [...resolved].sort()
    const declared = readDeclaredDependencies(entry)

    const missingDependencies = expected.filter((dep) => !declared.includes(dep))
    const extraDependencies = declared.filter((dep) => !expected.includes(dep))

    if (
      missingFiles.length > 0 ||
      missingDependencies.length > 0 ||
      extraDependencies.length > 0
    ) {
      issues.push({
        exampleName,
        missingFiles,
        missingDependencies,
        extraDependencies,
      })
    }

    // Never rewrite an entry whose files are missing. The derived list would
    // be wrong, and silently dropping deps is worse than failing loudly.
    if (
      mode === "fix" &&
      missingFiles.length === 0 &&
      (missingDependencies.length > 0 || extraDependencies.length > 0)
    ) {
      writeDependencies(entry, expected)
      changed = true
    }
  }

  if (changed) {
    await manifest.save()
  }

  return issues
}

export function assertNoMissingExampleFiles(issues: ExampleIssue[]) {
  const broken = issues.filter((issue) => issue.missingFiles.length > 0)

  if (broken.length === 0) {
    return
  }

  const detail = broken
    .map((issue) => `  ${issue.exampleName}: ${issue.missingFiles.join(", ")}`)
    .join("\n")

  throw new Error(`Registry examples reference files that do not exist:\n${detail}`)
}

function reportIssues(issues: ExampleIssue[]) {
  for (const issue of issues) {
    console.error(`\n[FAIL] ${issue.exampleName}`)
    if (issue.missingFiles.length > 0) {
      console.error(`  missing files:        ${issue.missingFiles.join(", ")}`)
    }
    if (issue.missingDependencies.length > 0) {
      console.error(`  undeclared deps:      ${issue.missingDependencies.join(", ")}`)
    }
    if (issue.extraDependencies.length > 0) {
      console.error(`  unused declared deps: ${issue.extraDependencies.join(", ")}`)
    }
  }
}

function isMainModule() {
  return process.argv[1]
    ? path.resolve(process.argv[1]) === scriptPath
    : false
}

if (isMainModule()) {
  const mode: SyncMode = process.argv.includes("--fix") ? "fix" : "check"
  const issues = await syncExampleRegistryDependencies({ mode })

  if (mode === "fix") {
    assertNoMissingExampleFiles(issues)
    console.log("registry-examples.ts is in sync")
  } else if (issues.length > 0) {
    reportIssues(issues)
    console.error(
      "\nRun `pnpm registry-deps:fix` and commit registry-examples.ts.\n"
    )
    process.exit(1)
  } else {
    console.log("registry-examples.ts is in sync")
  }
}

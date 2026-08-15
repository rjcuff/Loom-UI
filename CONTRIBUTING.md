# Contributing

## Setup

```bash
pnpm install
pnpm build:registry
pnpm dev
```

Node 22+, pnpm 9+.

## Adding a component

The registry is the contract. A component is not "done" until all five pieces
line up under one kebab-case name.

### 1. The component

`apps/www/registry/loomui/<name>.tsx`

- Named export, matching the PascalCase of the file name.
- Export a `<Name>Props` interface. Extend the underlying element's props and
  spread the rest so consumers can pass `id`, `aria-*`, and friends.
- Merge `className` last, through `cn()`.
- Add `"use client"` only if the component actually uses hooks or events.
- Guard motion with `motion-reduce:` variants or a `paused`-style prop.

### 2. The demo

`apps/www/registry/example/<name>-demo.tsx`

- **Default** export, because the preview renders it generically.
- Import the component through `@/registry/loomui/<name>`. The dependency sync
  script reads that import. It is how the manifest stays correct.
- Keep it to the one idea the component is for.

### 3. The manifests

`registry-ui.ts`:

```ts
{
  name: "your-component",
  type: "registry:ui",
  title: "Your Component",
  description: "One sentence, sentence case, no trailing period problems.",
  dependencies: ["motion"],          // npm packages
  registryDependencies: ["utils"],   // other registry items
  files: [{ path: "loomui/your-component.tsx", type: "registry:ui" }],
  cssVars: { theme: { "animate-x": "x 1s linear infinite" } },
  css: { "@keyframes x": { from: {}, to: {} } },
}
```

`registry-examples.ts` gets the matching `-demo` entry. Leave
`registryDependencies` to the sync script.

### 4. The docs

`apps/www/content/docs/components/<name>.mdx`, following the existing shape:
preview, Installation (CLI / Manual tabs), Usage, Props table.

### 5. The sidebar

Add the page to `apps/www/config/docs.ts`. Order there is the order readers
walk the docs in, and it drives the prev/next buttons.

## Before opening a PR

```bash
pnpm build:registry   # regenerate artifacts
pnpm check            # typecheck + format + registry dep sync
```

Commit the generated files. CI re-runs `build:registry` and fails if anything
differs from what you committed.

## Commit messages

Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.

<div align="center">

# Loom UI

**Open-source animated components for React.**
Weave motion into your interface, one file at a time.

[Documentation](https://loomui.design) · [Components](https://loomui.design/docs/components/weave-text) · [Contributing](CONTRIBUTING.md)

<img src="apps/www/public/demo.gif" alt="loom components in motion" width="100%" />

</div>

## Install

Components are copied into your project rather than installed as a dependency,
distributed through a [shadcn](https://ui.shadcn.com/docs/registry)-compatible
registry:

```bash
npx shadcn@latest add @loomui/weave-text
```

You own the file from that moment on. Edit it, delete it, rename it — nothing
upstream breaks.

## Components

| Component                                                       | What it does                                                                        |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [`weave-text`](https://loomui.design/docs/components/weave-text)             | Text filled with a slow-drifting gradient, woven from a palette you control.         |
| [`stagger-text`](https://loomui.design/docs/components/stagger-text)         | Words or characters that rise into place one after another, on mount or on scroll.   |
| [`typewriter`](https://loomui.design/docs/components/typewriter)             | Phrases typed out and deleted in a loop, with a caret and no layout shift.           |
| [`scramble-text`](https://loomui.design/docs/components/scramble-text)       | A string that resolves out of random glyphs, left to right.                          |
| [`count-up`](https://loomui.design/docs/components/count-up)                 | A number that counts to its value when it scrolls into view.                         |
| [`grid-backdrop`](https://loomui.design/docs/components/grid-backdrop)       | An SVG grid with cells that fade in and out at a deterministic, seeded scatter.      |
| [`grid-beams`](https://loomui.design/docs/components/grid-beams)             | A ruled grid with neon beams running down random lines, fading out toward the edges. |
| [`aurora-backdrop`](https://loomui.design/docs/components/aurora-backdrop)   | A wash of blurred colour that drifts behind content on cycles that never line up.    |
| [`spotlight-card`](https://loomui.design/docs/components/spotlight-card)     | A surface with a soft highlight that follows the pointer and fades out on leave.     |
| [`tilt-card`](https://loomui.design/docs/components/tilt-card)               | A surface that leans away from the pointer in 3D and settles back on leave.          |
| [`magnetic`](https://loomui.design/docs/components/magnetic)                 | A wrapper that pulls its child toward the pointer as the pointer gets close.         |
| [`marquee`](https://loomui.design/docs/components/marquee)                   | A seamless scrolling row or column, in either direction, that pauses on hover.       |
| [`reading-progress`](https://loomui.design/docs/components/reading-progress) | A pinned bar that tracks how far through the page the reader is.                     |

## Local development

Requires Node 22.14+ and pnpm 9+.

```bash
pnpm install
pnpm build:registry   # generate __index__.tsx, registry.json, public/r/*.json
pnpm dev              # http://localhost:3000
```

### Repository layout

```
.
├── apps/www                  # docs site (Next.js 15, App Router, fumadocs MDX)
│   ├── app/                  # routes: (marketing) and (docs)
│   ├── content/docs/         # MDX docs, one file per component
│   ├── components/           # docs site chrome (not shipped to users)
│   ├── registry/
│   │   ├── loomui/           # the components users install
│   │   ├── example/          # demos rendered in the docs
│   │   ├── lib/              # shared helpers shipped with components
│   │   ├── registry-*.ts     # hand-written manifests
│   │   ├── index.ts          # merged + schema-validated registry
│   │   └── __index__.tsx     # GENERATED lazy component map
│   ├── scripts/              # registry build + dependency sync
│   └── public/r/             # GENERATED per-component JSON
└── turbo.json                # task graph
```

### Scripts

| Command                    | Does                                               |
| -------------------------- | -------------------------------------------------- |
| `pnpm dev`                 | Run the docs site                                  |
| `pnpm build`               | Build the registry, then the site                  |
| `pnpm build:registry`      | Regenerate every registry artifact                 |
| `pnpm registry-deps:check` | Fail if example imports and manifest deps disagree |
| `pnpm registry-deps:fix`   | Rewrite manifest deps from example imports         |
| `pnpm typecheck`           | `tsc --noEmit`                                     |
| `pnpm format:check`        | Prettier                                           |
| `pnpm check`               | Typecheck, format check, and registry deps check   |

## Adding a component

1. Write `apps/www/registry/loomui/<name>.tsx`. Named export, no default.
2. Write a demo at `apps/www/registry/example/<name>-demo.tsx` with a default
   export.
3. Add entries to `registry-ui.ts` and `registry-examples.ts`. Declare npm
   packages under `dependencies`, other registry items under
   `registryDependencies`, and any keyframes under `cssVars` / `css`.
4. Write `apps/www/content/docs/components/<name>.mdx`.
5. Add the page to `apps/www/config/docs.ts` so it appears in the sidebar.
6. Run `pnpm build:registry` and commit the generated files.

> Names are load-bearing: the component file, the docs slug, the demo, and the
> manifest entry all share one kebab-case name.

### Generated files

These are committed and checked for drift in CI. **Never edit them by hand.**

- `apps/www/registry/__index__.tsx`
- `apps/www/registry.json`
- `apps/www/public/registry.json`
- `apps/www/public/r/*.json`
- `apps/www/public/llms.txt`, `apps/www/public/llms-full.txt`

## License

[MIT](LICENSE.md)

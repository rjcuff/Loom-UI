# loom

Open-source animated components for React. Weave motion into your interface,
one file at a time.

<img src="apps/www/public/demo.gif" alt="loom components in motion" width="100%" />

Components are copied into your project rather than installed as a dependency,
distributed through a [shadcn](https://ui.shadcn.com/docs/registry)-compatible
registry:

```bash
npx shadcn@latest add @loomui/weave-text
```

## Repository layout

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

## Getting started

```bash
pnpm install
pnpm build:registry   # generate __index__.tsx, registry.json, public/r/*.json
pnpm dev              # http://localhost:3000
```

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

Names are load-bearing: the component file, the docs slug, the demo, and the
manifest entry all share one kebab-case name.

## Generated files

These are committed and checked for drift in CI. Never edit them by hand.

- `apps/www/registry/__index__.tsx`
- `apps/www/registry.json`
- `apps/www/public/registry.json`
- `apps/www/public/r/*.json`
- `apps/www/public/llms.txt`, `apps/www/public/llms-full.txt`

## Scripts

| Command                    | Does                                                        |
| -------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                 | Run the docs site                                           |
| `pnpm build`               | Build the registry, then the site                           |
| `pnpm build:registry`      | Regenerate every registry artifact                          |
| `pnpm registry-deps:check` | Fail if example imports and manifest deps disagree          |
| `pnpm registry-deps:fix`   | Rewrite manifest deps from example imports                  |
| `pnpm typecheck`           | `tsc --noEmit`                                              |
| `pnpm format:check`        | Prettier                                                    |

## License

MIT.

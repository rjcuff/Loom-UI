/// <reference types="next" />
/// <reference types="next/image-types/global" />

// `next-env.d.ts` carries these same references, but Next regenerates it on
// `next dev` / `next build` and it is gitignored. CI runs `tsc --noEmit`
// without building first, so on a clean checkout the static image imports in
// components/logo.tsx have no module declaration and typecheck fails.
//
// This file is committed, so the types are there whether or not Next has run.

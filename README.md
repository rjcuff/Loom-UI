<div align="center">

<img alt="Loom UI - animated React components for design engineers" src="apps/www/public/demo.gif" width="100%">

<h3 align="center">Loom UI</h3>

<p align="center">
    Animated React components for design engineers
</p>

<div align="center">
  <a href="https://github.com/rjcuff/Loom-UI/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/rjcuff/Loom-UI"></a>
  <a href="https://github.com/rjcuff/Loom-UI/blob/main/LICENSE.md"><img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
  <a href="https://ui.shadcn.com/docs/registry"><img alt="shadcn registry" src="https://img.shields.io/badge/shadcn-registry-black.svg"></a>
  <a href="https://loomui.design/docs/components"><img alt="Components" src="https://img.shields.io/badge/components-43-blue"></a>
</div>

</div>

## Documentation

Visit https://loomui.design/docs to view the documentation.

## Installation

Components are copied into your project rather than installed as a dependency,
through a [shadcn](https://ui.shadcn.com/docs/registry)-compatible registry:

```bash
npx shadcn@latest add @loomui/weave-text
```

You own the file from that moment on. Edit it, delete it, rename it. Nothing
upstream breaks. Every component below installs the same way, with its own name
in place of `weave-text`.

## Why Loom UI

- **No animation library.** Nothing added to your bundle, no provider to wrap
  your app in, no config object. CSS does the work wherever CSS can, which is
  more often than most libraries assume.
- **One file each.** Read it in a minute, keep it, change it, throw it out.
- **Reduced motion, everywhere.** Every component checks
  `prefers-reduced-motion` itself and settles into its finished state rather
  than disappearing.
- **Made for shadcn/ui.** The same tokens, the same `cn()` helper, the same
  conventions, so Loom components sit beside yours without translation.

## Components

43 components, none of which depend on this project at runtime.

### Interface

| Component                                                                    | What it does                                                                                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`drawer`](https://loomui.design/docs/components/drawer)                     | A panel that comes in from any edge and covers most of the screen, dragged anywhere on its face to send it back out.            |
| [`spool`](https://loomui.design/docs/components/spool)                       | A container that changes shape to fit whatever it is showing, on a spring that carries its velocity through an interruption.    |
| [`photo-stamp`](https://loomui.design/docs/components/photo-stamp)           | A photo that lifts off the page at full size over a blurred backdrop, the same element the whole way.                           |
| [`icon-morph`](https://loomui.design/docs/components/icon-morph)             | One icon that turns into another by moving its own pieces, so there is never a frame with both glyphs on screen.                |
| [`progress-ring`](https://loomui.design/docs/components/progress-ring)       | A circular progress ring whose value springs to its target, so a number that changes mid travel keeps the speed it already had. |
| [`elastic-tabs`](https://loomui.design/docs/components/elastic-tabs)         | A tab group whose pill stretches to cover both tabs before it contracts onto the one you picked.                                |
| [`unfold-list`](https://loomui.design/docs/components/unfold-list)           | A disclosure list whose panels turn down onto the page from their top edge.                                                     |
| [`loom-slider`](https://loomui.design/docs/components/loom-slider)           | A row of dashes where the one you are holding stands tallest, with the rise travelling the track as you drag.                   |
| [`compare-slider`](https://loomui.design/docs/components/compare-slider)     | Two versions of the same frame, split by a divider you drag, or move with the arrow keys.                                       |
| [`loom-loader`](https://loomui.design/docs/components/loom-loader)           | Threads drawn through a frame and pulled off the far side, with a shuttle crossing them.                                        |
| [`shimmer-skeleton`](https://loomui.design/docs/components/shimmer-skeleton) | A placeholder block with a shimmer that passes across it while the real thing loads.                                            |
| [`reading-progress`](https://loomui.design/docs/components/reading-progress) | A pinned bar that tracks how far through the page, or a chosen element, the reader is.                                          |
| [`bento-grid`](https://loomui.design/docs/components/bento-grid)             | A grid of tiles of different sizes that arrive one after another when the grid is reached.                                      |
| [`card-stack`](https://loomui.design/docs/components/card-stack)             | Cards that pin one behind another as the page scrolls, each settling behind the next.                                           |
| [`marquee`](https://loomui.design/docs/components/marquee)                   | A seamless scrolling row or column, in either direction, that pauses on hover.                                                  |
| [`testimonial-wall`](https://loomui.design/docs/components/testimonial-wall) | Columns of quotes drifting past each other at different speeds, faded at both ends.                                             |
| [`terminal`](https://loomui.design/docs/components/terminal)                 | A window that types its commands out and prints their output a beat later.                                                      |
| [`thread-timeline`](https://loomui.design/docs/components/thread-timeline)   | A timeline whose thread is sewn down the page as you read, lighting each node as it reaches it.                                 |
| [`ticket-stub`](https://loomui.design/docs/components/ticket-stub)           | A card torn along a perforation, with a notch bitten out of the paper at each end of it.                                        |
| [`logo-loom`](https://loomui.design/docs/components/logo-loom)               | A logo row woven into place, every other mark arriving from the other side of the thread.                                       |

### Text

| Component                                                              | What it does                                                                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [`weave-text`](https://loomui.design/docs/components/weave-text)       | Text filled with a slow-drifting gradient, woven from a palette you control.                            |
| [`stagger-text`](https://loomui.design/docs/components/stagger-text)   | Words or characters that rise into place one after another, on mount or on scroll.                      |
| [`typewriter`](https://loomui.design/docs/components/typewriter)       | Phrases typed out and deleted in a loop, with a caret and no layout shift.                              |
| [`scramble-text`](https://loomui.design/docs/components/scramble-text) | A string that resolves out of random glyphs, left to right, on mount, on scroll, or on hover.           |
| [`lens-text`](https://loomui.design/docs/components/lens-text)         | Text held out of focus until the pointer passes over it like a magnifying glass.                        |
| [`split-flap`](https://loomui.design/docs/components/split-flap)       | A departure board that flaps through its glyphs, one cell behind the last, until it lands on the value. |
| [`count-up`](https://loomui.design/docs/components/count-up)           | A number that counts to its value when it scrolls into view, without a render per frame.                |

### Effects

| Component                                                                | What it does                                                                                      |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| [`magnetic`](https://loomui.design/docs/components/magnetic)             | A wrapper that pulls its child toward the pointer as the pointer gets close.                      |
| [`image-trail`](https://loomui.design/docs/components/image-trail)       | Images dropped along the pointer's path, spaced by distance travelled rather than by time.        |
| [`sticker-peel`](https://loomui.design/docs/components/sticker-peel)     | A card whose corner lifts off the page on hover, folded back over the crease to show its backing. |
| [`tilt-card`](https://loomui.design/docs/components/tilt-card)           | A surface that leans away from the pointer in 3D and settles back on leave.                       |
| [`spotlight-card`](https://loomui.design/docs/components/spotlight-card) | A surface with a soft highlight that follows the pointer and fades out on leave.                  |
| [`flip-card`](https://loomui.design/docs/components/flip-card)           | A card with two faces that turns in 3D when it is clicked, controlled or on its own.              |

### Buttons

| Component                                                                  | What it does                                                                                                   |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`hold-button`](https://loomui.design/docs/components/hold-button)         | A button that fires only after a deliberate press and hold, with a fill sweeping across to count out the wait. |
| [`ripple-button`](https://loomui.design/docs/components/ripple-button)     | A button that sends a circle out from wherever it was pressed, sized to reach the furthest corner.             |
| [`confetti-button`](https://loomui.design/docs/components/confetti-button) | A button that throws a handful of paper into the air on press, each piece lobbed on its own arc.               |

### Backgrounds

| Component                                                                  | What it does                                                                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [`aurora-backdrop`](https://loomui.design/docs/components/aurora-backdrop) | A wash of blurred colour that drifts behind content on cycles that never line up.                 |
| [`grid-beams`](https://loomui.design/docs/components/grid-beams)           | A ruled grid with neon beams running down random lines, fading out toward the edges.              |
| [`grid-backdrop`](https://loomui.design/docs/components/grid-backdrop)     | An SVG grid with cells that fade in and out at a deterministic, seeded scatter.                   |
| [`stitch-path`](https://loomui.design/docs/components/stitch-path)         | A running stitch sewn along an SVG path as the page scrolls, following the holes it is laid over. |

### Mockups

| Component                                                  | What it does                                                                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [`iphone`](https://loomui.design/docs/components/iphone)   | A device frame drawn from the real measurements, with a screen you put anything in.                         |
| [`ipad`](https://loomui.design/docs/components/ipad)       | A tablet frame drawn from the real measurements, upright or on its side, with a screen you put anything in. |
| [`macbook`](https://loomui.design/docs/components/macbook) | A laptop frame with the camera housing cut into the display and the scoop cut into its base.                |

## Works with your coding agent

The registry publishes [`llms.txt`](https://loomui.design/llms.txt) and
[`llms-full.txt`](https://loomui.design/llms-full.txt), so Claude Code, Cursor
and v0 can read the whole catalogue and install from it directly:

```
Add the split-flap component from https://loomui.design/llms.txt
```

## Contributing

Visit our [contributing guide](https://github.com/rjcuff/Loom-UI/blob/main/CONTRIBUTING.md)
to learn how to contribute. A component is five files sharing one name, and the
guide walks through each of them.

Requires Node 22.14+ and pnpm 9+.

```bash
pnpm install
pnpm build:registry   # generate __index__.tsx, registry.json, public/r/*.json
pnpm dev              # http://localhost:3000
```

> Generated files are committed and drift-checked in CI. Run
> `pnpm build:registry` after touching a manifest, and never edit
> `registry/__index__.tsx`, `registry.json` or `public/r/*.json` by hand.

## Authors

<a href="https://github.com/rjcuff/Loom-UI/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=rjcuff/Loom-UI" />
</a>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=rjcuff/Loom-UI&type=Date)](https://www.star-history.com/#rjcuff/Loom-UI&Date)

## License

Licensed under the [MIT license](https://github.com/rjcuff/Loom-UI/blob/main/LICENSE.md).

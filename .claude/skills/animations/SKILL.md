---
name: animations
description: loom's motion system. Use when designing, reviewing, or implementing any web animation: easing, duration, springs, entrance/exit transitions, hover states, micro-interactions, scroll reveals, reduced-motion handling, or animation performance. Also use when authoring a loom registry component, since every shipped component must satisfy the motion contract in this file. Triggers on easing, cubic-bezier, ease-out, spring, keyframes, transform, transition, stagger, fade, slide, scale, hover effect, "feels janky", "make it smooth", prefers-reduced-motion, will-change, GPU, Motion/Framer Motion.
---

# loom motion system

Motion is the product here. A loom component that animates badly is worse than
no component, because the reader is going to copy it into a real app and live
with it.

This file is the contract. It is also shipped in the repo so anyone can lift it
into their own project.

Credit: the underlying craft principles here follow Emil Kowalski's
[Animations on the Web](https://animations.dev). The tokens, thresholds, and
component rules below are loom's own encoding of them.

---

## The four questions

Answer these before writing a single line of animation code.

1. **Is the element entering or leaving the screen?** Use `ease-out`
2. **Is an already-visible element moving or morphing?** Use `ease-in-out`
3. **Is it a hover or color change?** Use `ease`
4. **Will the user trigger this more than ~100 times a day?** **Don't animate it.**

Question 4 outranks the other three. Frequency beats craft. A beautifully eased
200ms transition on a button someone clicks all day is a 200ms tax they pay all
day.

---

## Tokens

These are defined in `apps/www/styles/globals.css` and are the only easing
values loom uses. Do not invent new curves; pick from this set.

```css
/* Entering / exiting. The default for almost everything */
--ease-out-quad:  cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
--ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);   /* loom default */
--ease-out-expo:  cubic-bezier(0.19, 1, 0.22, 1);

/* On-screen movement */
--ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
--ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
```

`--ease-out-quart` is loom's house curve. Reach for it unless you have a reason.

### Duration scale

| Token           | Value   | Use for                                       |
| --------------- | ------- | --------------------------------------------- |
| `--duration-1`  | `120ms` | Micro-interactions: press, toggle, icon swap  |
| `--duration-2`  | `180ms` | Standard UI: tooltip, dropdown, tab           |
| `--duration-3`  | `240ms` | Modals, drawers, popovers                     |
| `--duration-4`  | `320ms` | Large surfaces, page-level transitions        |

Hard ceiling for product UI: **300ms**. Marketing surfaces (the landing page,
a hero) may go longer, since they are seen once, not a hundred times.

Two adjustments:

- **Bigger travels slower.** Scale duration with distance, not with importance.
- **Exits run ~20% faster than entrances.** Nobody wants to wait to dismiss.

---

## Rules

### Only animate `transform` and `opacity`

These are the two properties the compositor can handle without touching layout
or paint. Everything else drops frames.

| Never animate                        | Animate instead                    |
| ------------------------------------ | ---------------------------------- |
| `width` / `height`                   | `transform: scale()`               |
| `top` / `left` / `margin`            | `transform: translate()`           |
| `background-position` on huge layers | keep the layer small               |
| `filter: blur()` above 20px          | stay under 20px, Safari especially |

`background-position` is the one sanctioned exception, used for gradient text
where the painted area is a few hundred pixels of glyph.

#### Tailwind v4 trap: `transform` is not what you think

v4 compiles `scale-*`, `rotate-*`, and `translate-*` to the **independent** CSS
properties (`scale:`, `rotate:`, `translate:`), not to `transform:`. So an
explicit transition list naming `transform` silently animates nothing. The
value snaps instead.

```tsx
/* broken: scale jumps, no animation */
className="transition-[opacity,transform] scale-75"

/* correct */
className="transition-[opacity,scale] scale-75"
```

The bare `transition` utility already covers `translate`, `scale`, and
`rotate`, so this only bites when you name properties explicitly. If a
transition looks instant despite correct duration and easing, check this
first.

### Anything pressable shows a pointer cursor

If it can be clicked, tapped, or toggled, the cursor must say so. This is the
cheapest affordance there is and its absence reads as "broken" long before
anyone can articulate why.

**Tailwind v4 changed this out from under you.** v3's preflight gave `button`
a `cursor: pointer`; v4 follows the browser default of `cursor: default`. Every
button in a v4 project is silently wrong until you put it back.

Fix it once, globally, rather than sprinkling `cursor-pointer` on components:

```css
@layer base {
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]),
  [role="tab"],
  [role="menuitem"],
  summary,
  label[for],
  select:not(:disabled),
  a[href] {
    cursor: pointer;
  }

  button:disabled,
  [aria-disabled="true"] {
    cursor: not-allowed;
  }
}
```

Covers custom controls too. A `<div role="button">` needs the same treatment
as a real `<button>`. Disabled controls get `not-allowed`, never `pointer`;
pointing at something that will not respond is worse than no affordance.

### Never start from zero

`scale(0)` makes a thing appear out of nothing. Real objects have shape before
they arrive.

```css
/* wrong */ from { opacity: 0; transform: scale(0);    }
/* right */ from { opacity: 0; transform: scale(0.96); }
```

Same for translation: `translateY(8px)`, not `translateY(80px)`.

### Scale from the trigger, not the center

A popover that grows from the middle of the screen has no spatial story. Set
`transform-origin` to where it came from. Radix exposes this:

```css
transform-origin: var(--radix-popover-content-transform-origin);
```

### Animate the child, not the hovered parent

If the hovered element moves, the cursor can fall off it and the animation
flickers. Keep the hit target still; move something inside it.

```tsx
<div className="group">
  <div className="transition-transform duration-200 group-hover:-translate-y-1" />
</div>
```

### Springs for gestures, curves for everything else

Use a spring when the motion can be interrupted mid-flight: drags, swipes,
anything following a finger. Springs keep velocity across interruptions; CSS
transitions restart from zero and look broken.

```tsx
// Prefer the duration/bounce form. It is legible.
transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
```

Keep `bounce` at 0 for anything in a product surface. Bounce is a personality
choice, and loom's personality is calm. Reserve 0.1 to 0.3 for drag-to-dismiss.

### Everything animated needs a reduced-motion escape

Not optional, not "except for opacity". Every single one.

```css
@media (prefers-reduced-motion: reduce) {
  .thing { animation: none; transition: none; }
}
```

In Tailwind, the `motion-reduce:` variant does this inline:

```tsx
className="animate-weave motion-reduce:animate-none"
```

In Motion, branch on the hook:

```tsx
const reduce = useReducedMotion()
<motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} />
```

### Don't animate keyboard paths

Arrow-key list navigation, shortcuts, focus movement. These are high-frequency
and the animation reads as lag.

---

## The loom component contract

Every component in `apps/www/registry/loomui/` must satisfy all of this before
it ships:

- [ ] Animates only `transform` / `opacity` (or documents why not)
- [ ] Uses a token from the easing set, not an ad-hoc `cubic-bezier`
- [ ] Duration is on the scale and under 300ms unless it is a marketing surface
- [ ] Has a `motion-reduce:` variant or an explicit reduced-motion query
- [ ] Exposes an escape hatch prop such as `duration`, `paused`, or `disabled`
- [ ] Does not start from `scale(0)` or a large translate
- [ ] Keyframes are declared in the registry manifest under `cssVars` / `css`,
      not assumed to already exist in the consumer's stylesheet
- [ ] Merges `className` last, through `cn()`, so consumers can override timing
- [ ] Any pressable part carries a pointer cursor, and disabled parts `not-allowed`

The escape hatch matters more than it looks. Someone is going to drop this into
a dashboard where it fires forty times per screen. Give them the off switch.

---

## Debugging

| Symptom                             | Cause and fix                                                        |
| ----------------------------------- | -------------------------------------------------------------------- |
| 1px jitter at start or end          | GPU handoff. Add `will-change: transform`.                            |
| Hover state strobes                 | The hovered element is moving. Animate a child instead.               |
| Feels sluggish at the "right" speed | You used `ease-in`. Switch to `ease-out`.                             |
| Feels mechanical                    | You used `linear`. Only marquees and progress get `linear`.           |
| Two things drift apart              | Paired elements need identical duration *and* easing.                 |
| Still off, can't say why            | Screen-record it, step frame by frame. Or mask the seam with <20px blur. |
| Janky under load                    | Move it to CSS. CSS animations run off the main thread; JS doesn't.   |
| Transition dead only on theme swap  | `next-themes` `disableTransitionOnChange` injects `transition: none !important` on everything mid-swap. Drop the prop, or drive that animation with `@keyframes` instead. |
| Button feels dead / arrow cursor    | Tailwind v4 preflight. See the pointer cursor rule above.             |

React-specific: never drive an animation through `useState` on every frame.
Every frame becomes a re-render and you will drop them. Write to a ref, or hand
it to CSS.

---

## Review format

When reviewing animation code, output a single markdown table. One row per
issue. No prose lists.

| Before                              | After                                      |
| ----------------------------------- | ------------------------------------------ |
| `transition: all 400ms ease-in`     | `transition: transform 180ms var(--ease-out-quart)` |
| `transform: scale(0)`               | `transform: scale(0.96)`                   |
| no reduced-motion handling          | `motion-reduce:animate-none`               |

---

## The point

Good motion is invisible. Nobody finishing a task should stop to admire a
transition. They should just not notice any friction. If a reviewer says "nice
animation," it is probably too much.

> Details that go unnoticed are the ones doing the work.

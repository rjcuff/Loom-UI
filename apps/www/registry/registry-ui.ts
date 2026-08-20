import { type Registry } from "shadcn/schema"

/**
 * `cssVars.theme` and `css` are appended to the consumer's globals.css by the
 * shadcn CLI. Every component that references an easing token ships that token
 * itself, so a single `add` is enough. Redeclaring a token is idempotent.
 */
const EASE_OUT_QUART = "cubic-bezier(0.165, 0.84, 0.44, 1)"
const EASE_IN_OUT_CUBIC = "cubic-bezier(0.645, 0.045, 0.355, 1)"
/** Leaves fast and lands slowly, which is what makes a panel feel light. */
const EASE_OUT_EXPO = "cubic-bezier(0.19, 1, 0.22, 1)"
/** Covers most of the distance in the first third. The curve panels want. */
const EASE_DRAWER = "cubic-bezier(0.32, 0.72, 0, 1)"
/** Overshoots and settles back, which is what makes a turn feel thrown. */
const EASE_BACK_OUT = "cubic-bezier(0.34, 1.32, 0.52, 1)"

export const ui: Registry["items"] = [
  {
    name: "weave-text",
    type: "registry:ui",
    title: "Weave Text",
    description:
      "Text filled with a slow-drifting gradient, woven from a palette you control.",
    registryDependencies: ["utils", "use-in-viewport"],
    files: [
      {
        path: "loomui/weave-text.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "animate-weave": "weave 8s linear infinite",
      },
    },
    css: {
      "@keyframes weave": {
        from: {
          "background-position": "0% 50%",
        },
        to: {
          "background-position": "200% 50%",
        },
      },
    },
  },
  {
    name: "stagger-text",
    type: "registry:ui",
    title: "Stagger Text",
    description:
      "Words or characters that rise into place one after another, on mount or on scroll.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/stagger-text.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
        "animate-stagger-reveal":
          "stagger-reveal 500ms var(--ease-out-quart) both",
      },
    },
    css: {
      "@keyframes stagger-reveal": {
        from: {
          opacity: "0",
          transform: "translateY(0.4em)",
        },
        to: {
          opacity: "1",
          transform: "translateY(0)",
        },
      },
    },
  },
  {
    name: "typewriter",
    type: "registry:ui",
    title: "Typewriter",
    description:
      "Phrases typed out and deleted in a loop, with a caret and no layout shift.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/typewriter.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "animate-caret-blink": "caret-blink 1.1s steps(2, jump-none) infinite",
      },
    },
    css: {
      "@keyframes caret-blink": {
        "0%, 100%": {
          opacity: "1",
        },
        "50%": {
          opacity: "0",
        },
      },
    },
  },
  {
    name: "scramble-text",
    type: "registry:ui",
    title: "Scramble Text",
    description:
      "A string that resolves out of random glyphs, left to right, on mount, on scroll, or on hover.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/scramble-text.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "count-up",
    type: "registry:ui",
    title: "Count Up",
    description:
      "A number that counts to its value when it scrolls into view, without a render per frame.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/count-up.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "lens-text",
    type: "registry:ui",
    title: "Lens Text",
    description:
      "Text held out of focus until the pointer passes over it like a magnifying glass.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/lens-text.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "split-flap",
    type: "registry:ui",
    title: "Split Flap",
    description:
      "A departure board that flaps through its glyphs, one cell behind the last, until it lands on the value.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/split-flap.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "animate-split-flap-out":
          "split-flap-out calc(var(--flap-duration, 62ms) * 0.5) ease-in both",
        "animate-split-flap-in":
          "split-flap-in calc(var(--flap-duration, 62ms) * 0.5) ease-out calc(var(--flap-duration, 62ms) * 0.5) both",
      },
    },
    css: {
      "@keyframes split-flap-out": {
        from: {
          transform: "rotateX(0deg)",
        },
        to: {
          transform: "rotateX(-90deg)",
        },
      },
      "@keyframes split-flap-in": {
        from: {
          transform: "rotateX(90deg)",
        },
        to: {
          transform: "rotateX(0deg)",
        },
      },
    },
  },
  {
    name: "grid-backdrop",
    type: "registry:ui",
    title: "Grid Backdrop",
    description:
      "An SVG grid with cells that fade in and out at a deterministic, seeded scatter.",
    registryDependencies: ["utils", "use-in-viewport"],
    files: [
      {
        path: "loomui/grid-backdrop.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-in-out-cubic": EASE_IN_OUT_CUBIC,
        "animate-grid-pulse": "grid-pulse 5s var(--ease-in-out-cubic) infinite",
      },
    },
    css: {
      "@keyframes grid-pulse": {
        "0%, 100%": {
          opacity: "0",
        },
        "50%": {
          opacity: "1",
        },
      },
    },
  },
  {
    name: "spotlight-card",
    type: "registry:ui",
    title: "Spotlight Card",
    description:
      "A surface with a soft highlight that follows the pointer and fades out on leave.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/spotlight-card.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "grid-beams",
    type: "registry:ui",
    title: "Grid Beams",
    description:
      "A ruled grid with neon beams running down random lines, fading out toward the edges.",
    registryDependencies: ["utils", "use-in-viewport"],
    files: [
      {
        path: "loomui/grid-beams.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "animate-grid-beam": "grid-beam 4s linear infinite",
        "animate-grid-beam-x": "grid-beam-x 4s linear infinite",
      },
    },
    css: {
      "@keyframes grid-beam": {
        from: {
          transform: "translateY(calc(-1 * var(--beam-length, 24%)))",
        },
        to: {
          transform: "translateY(100%)",
        },
      },
      "@keyframes grid-beam-x": {
        from: {
          transform: "translateX(calc(-1 * var(--beam-length, 24%)))",
        },
        to: {
          transform: "translateX(100%)",
        },
      },
    },
  },
  {
    name: "aurora-backdrop",
    type: "registry:ui",
    title: "Aurora Backdrop",
    description:
      "A wash of blurred colour that drifts behind content on cycles that never line up.",
    registryDependencies: ["utils", "use-in-viewport"],
    files: [
      {
        path: "loomui/aurora-backdrop.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-in-out-cubic": EASE_IN_OUT_CUBIC,
        "animate-aurora-drift":
          "aurora-drift 18s var(--ease-in-out-cubic) infinite",
      },
    },
    css: {
      "@keyframes aurora-drift": {
        "0%, 100%": {
          transform: "translate(0%, 0%) scale(1)",
        },
        "33%": {
          transform: "translate(26%, -22%) scale(1.35)",
        },
        "66%": {
          transform: "translate(-24%, 18%) scale(0.75)",
        },
      },
    },
  },
  {
    name: "stitch-path",
    type: "registry:ui",
    title: "Stitch Path",
    description:
      "A running stitch sewn along an SVG path as the page scrolls, following the holes it is laid over.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/stitch-path.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "tilt-card",
    type: "registry:ui",
    title: "Tilt Card",
    description:
      "A surface that leans away from the pointer in 3D and settles back on leave.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/tilt-card.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "flip-card",
    type: "registry:ui",
    title: "Flip Card",
    description:
      "A card with two faces that turns in 3D when it is clicked, controlled or on its own.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/flip-card.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-back-out": EASE_BACK_OUT,
      },
    },
  },
  {
    name: "hold-button",
    type: "registry:ui",
    title: "Hold Button",
    description:
      "A button that fires only after a deliberate press and hold, with a fill sweeping across to count out the wait.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/hold-button.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "ripple-button",
    type: "registry:ui",
    title: "Ripple Button",
    description:
      "A button that sends a circle out from wherever it was pressed, sized to reach the furthest corner.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/ripple-button.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
        "animate-ripple-expand":
          "ripple-expand var(--ripple-duration, 280ms) var(--ease-out-quart) forwards",
      },
    },
    css: {
      "@keyframes ripple-expand": {
        from: {
          transform: "scale(0)",
          opacity: "1",
        },
        to: {
          transform: "scale(1)",
          opacity: "0",
        },
      },
    },
  },
  {
    name: "confetti-button",
    type: "registry:ui",
    title: "Confetti Button",
    description:
      "A button that throws a handful of paper into the air on press, each piece lobbed on its own arc.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/confetti-button.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "animate-confetti-drift":
          "confetti-drift var(--confetti-duration, 900ms) linear forwards",
        "animate-confetti-fall":
          "confetti-fall var(--confetti-duration, 900ms) forwards",
      },
    },
    css: {
      "@keyframes confetti-drift": {
        "0%": {
          transform: "translateX(0)",
          opacity: "1",
        },
        "70%": {
          opacity: "1",
        },
        "100%": {
          transform: "translateX(var(--drift, 0px))",
          opacity: "0",
        },
      },
      "@keyframes confetti-fall": {
        "0%": {
          transform: "translateY(0) rotate(0deg)",
          "animation-timing-function": EASE_OUT_QUART,
        },
        "32%": {
          transform:
            "translateY(var(--rise, 0px)) rotate(calc(var(--spin, 0deg) * 0.3))",
          "animation-timing-function": "cubic-bezier(0.55, 0.06, 0.68, 0.19)",
        },
        "100%": {
          transform: "translateY(var(--fall, 0px)) rotate(var(--spin, 0deg))",
        },
      },
    },
  },
  {
    name: "elastic-tabs",
    type: "registry:ui",
    title: "Elastic Tabs",
    description:
      "A tab group whose pill stretches to cover both tabs before it contracts onto the one you picked.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/elastic-tabs.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "ticket-stub",
    type: "registry:ui",
    title: "Ticket Stub",
    description:
      "A card torn along a perforation, with a notch bitten out of the paper at each end of it.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/ticket-stub.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "compare-slider",
    type: "registry:ui",
    title: "Compare Slider",
    description:
      "Two versions of the same frame, split by a divider you drag, or move with the arrow keys.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/compare-slider.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "sticker-peel",
    type: "registry:ui",
    title: "Sticker Peel",
    description:
      "A card whose corner lifts off the page on hover, folded back over the crease to show its backing.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/sticker-peel.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "magnetic",
    type: "registry:ui",
    title: "Magnetic",
    description:
      "A wrapper that pulls its child toward the pointer as the pointer gets close.",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/magnetic.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "marquee",
    type: "registry:ui",
    title: "Marquee",
    description:
      "A seamless scrolling row or column, in either direction, that pauses on hover.",
    registryDependencies: ["utils", "use-in-viewport"],
    files: [
      {
        path: "loomui/marquee.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "animate-marquee":
          "marquee var(--marquee-duration, 40s) linear infinite",
        "animate-marquee-vertical":
          "marquee-vertical var(--marquee-duration, 40s) linear infinite",
      },
    },
    css: {
      "@keyframes marquee": {
        from: {
          transform: "translateX(0)",
        },
        to: {
          transform: "translateX(calc(-100% - var(--marquee-gap, 1rem)))",
        },
      },
      "@keyframes marquee-vertical": {
        from: {
          transform: "translateY(0)",
        },
        to: {
          transform: "translateY(calc(-100% - var(--marquee-gap, 1rem)))",
        },
      },
    },
  },
  {
    name: "reading-progress",
    type: "registry:ui",
    title: "Reading Progress",
    description:
      "A pinned bar that tracks how far through the page, or a chosen element, the reader is.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/reading-progress.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "testimonial-wall",
    type: "registry:ui",
    title: "Testimonial Wall",
    description:
      "Columns of quotes drifting past each other at different speeds, faded at both ends.",
    registryDependencies: ["utils", "use-in-viewport"],
    files: [
      {
        path: "loomui/testimonial-wall.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "animate-marquee-vertical":
          "marquee-vertical var(--marquee-duration, 40s) linear infinite",
      },
    },
    css: {
      "@keyframes marquee-vertical": {
        from: {
          transform: "translateY(0)",
        },
        to: {
          transform: "translateY(calc(-100% - var(--marquee-gap, 1rem)))",
        },
      },
    },
  },
  {
    name: "logo-loom",
    type: "registry:ui",
    title: "Logo Loom",
    description:
      "A logo row woven into place, every other mark arriving from the other side of the thread.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/logo-loom.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
        "animate-loom-weave": "loom-weave 700ms var(--ease-out-quart) both",
      },
    },
    css: {
      "@keyframes loom-weave": {
        from: {
          opacity: "0",
          transform: "translateY(var(--loom-from, 1.5rem))",
        },
        to: {
          opacity: "1",
          transform: "translateY(0)",
        },
      },
    },
  },
  {
    name: "iphone",
    type: "registry:ui",
    title: "iPhone",
    description:
      "A device frame drawn from the real measurements, with a screen you put anything in.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/iphone.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "ipad",
    type: "registry:ui",
    title: "iPad",
    description:
      "A tablet frame drawn from the real measurements, upright or on its side, with a screen you put anything in.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/ipad.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "macbook",
    type: "registry:ui",
    title: "MacBook",
    description:
      "A laptop frame with the camera housing cut into the display and the scoop cut into its base.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/macbook.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "thread-timeline",
    type: "registry:ui",
    title: "Thread Timeline",
    description:
      "A timeline whose thread is sewn down the page as you read, lighting each node as it reaches it.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/thread-timeline.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "loom-loader",
    type: "registry:ui",
    title: "Loom Loader",
    description:
      "Threads drawn through a frame and pulled off the far side, with a shuttle crossing them.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/loom-loader.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-in-out-cubic": EASE_IN_OUT_CUBIC,
        "animate-loom-thread":
          "loom-thread var(--loom-duration, 1400ms) ease-in-out infinite",
        "animate-loom-shuttle":
          "loom-shuttle var(--loom-duration, 1400ms) var(--ease-in-out-cubic) infinite alternate",
      },
    },
    css: {
      "@keyframes loom-thread": {
        "0%": {
          "stroke-dashoffset": "1",
        },
        "40%, 60%": {
          "stroke-dashoffset": "0",
        },
        "100%": {
          "stroke-dashoffset": "-1",
        },
      },
      "@keyframes loom-shuttle": {
        from: {
          transform: "translateX(0)",
        },
        to: {
          transform: "translateX(var(--loom-sweep, 30px))",
        },
      },
    },
  },
  {
    name: "loom-slider",
    type: "registry:ui",
    title: "Loom Slider",
    description:
      "A row of dashes where the one you are holding stands tallest, with the rise travelling the track as you drag.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/loom-slider.tsx",
        type: "registry:ui",
      },
    ],
    // No keyframes: the dashes are drawn from one animation frame loop, since a
    // CSS transition restarted on every pointer move never arrives.
  },
  {
    name: "progress-ring",
    type: "registry:ui",
    title: "Progress Ring",
    description:
      "A circular progress ring whose value springs to its target, so a number that changes mid travel keeps the speed it already had.",
    registryDependencies: ["utils", "use-spring"],
    files: [
      {
        path: "loomui/progress-ring.tsx",
        type: "registry:ui",
      },
    ],
    // No keyframes. The spring owns every frame.
  },
  {
    name: "spool",
    type: "registry:ui",
    title: "Spool",
    description:
      "A container that changes shape to fit whatever it is showing, on a spring that carries its velocity through an interruption.",
    registryDependencies: ["utils", "use-spring"],
    files: [
      {
        path: "loomui/spool.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
        "animate-spool-leave":
          "spool-leave 140ms var(--ease-out-quart) forwards",
      },
    },
    css: {
      // Out of focus on the way out as well as down. Fading alone leaves the
      // old words legible right up to the moment they vanish.
      "@keyframes spool-leave": {
        to: {
          opacity: "0",
          filter: "blur(4px)",
        },
      },
    },
  },
  {
    name: "icon-morph",
    type: "registry:ui",
    title: "Icon Morph",
    description:
      "One icon that turns into another by moving its own pieces, so there is never a frame with both glyphs on screen.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/icon-morph.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
  {
    name: "photo-stamp",
    type: "registry:ui",
    title: "Photo Stamp",
    description:
      "A photo that lifts off the page at full size over a blurred backdrop, the same element the whole way.",
    registryDependencies: ["utils", "use-spring"],
    files: [
      {
        path: "loomui/photo-stamp.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
        "animate-photo-stamp-veil-in":
          "photo-stamp-veil-in 240ms var(--ease-out-quart)",
        // Long enough that the veil is not gone while the card is still on its
        // way home, short enough that it never has to be cut off at the end.
        "animate-photo-stamp-veil-out":
          "photo-stamp-veil-out 300ms var(--ease-out-quart) forwards",
        // Backwards, not both. An entrance that holds its last frame outranks
        // the inline styles the photo is painted with.
        "animate-photo-stamp-caption-in":
          "photo-stamp-caption-in 240ms var(--ease-out-quart) 160ms backwards",
      },
    },
    css: {
      // One frame each, so the missing end is taken from wherever the veil
      // actually is. An exit written from opacity 1 flashes back to full first.
      "@keyframes photo-stamp-veil-in": {
        from: {
          opacity: "0",
        },
      },
      "@keyframes photo-stamp-veil-out": {
        to: {
          opacity: "0",
        },
      },
      "@keyframes photo-stamp-caption-in": {
        from: {
          opacity: "0",
          translate: "0 6px",
        },
      },
    },
  },
  {
    name: "drawer",
    type: "registry:ui",
    title: "Drawer",
    description:
      "A panel that comes in from any edge and covers most of the screen, dragged anywhere on its face to send it back out.",
    dependencies: ["@radix-ui/react-dialog"],
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/drawer.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-drawer": EASE_DRAWER,
        // No fill mode on the way in: an animation holding its last frame
        // outranks inline styles for good, and the drag has nothing to move.
        "animate-drawer-in": "drawer-in 260ms var(--ease-drawer)",
        "animate-drawer-out": "drawer-out 200ms var(--ease-drawer) forwards",
        "animate-drawer-rise":
          "drawer-content-rise 200ms var(--ease-drawer) 60ms both",
        "animate-drawer-overlay-in":
          "drawer-overlay-in 260ms var(--ease-drawer)",
        "animate-drawer-overlay-out":
          "drawer-overlay-out 200ms var(--ease-drawer) forwards",
      },
    },
    css: {
      // One frame each. The missing frame comes from wherever the panel is, so
      // the same pair serves all four edges, parked or dragged wide open.
      "@keyframes drawer-in": {
        from: {
          translate: "var(--drawer-closed)",
        },
      },
      "@keyframes drawer-out": {
        to: {
          translate: "var(--drawer-closed)",
        },
      },
      "@keyframes drawer-overlay-in": {
        from: {
          opacity: "0",
        },
        to: {
          opacity: "1",
        },
      },
      // One frame. The missing `from` comes from wherever the overlay is, so a
      // drag that already faded it does not get yanked back to full first.
      "@keyframes drawer-overlay-out": {
        to: {
          opacity: "0",
        },
      },
      // The panel lands, then its contents settle into it. Three stops rather
      // than two: the fade finishes early so the last of the travel is pure
      // movement, and the drawer reads as one thing arriving, not two.
      "@keyframes drawer-content-rise": {
        from: {
          opacity: "0",
          translate: "var(--drawer-rise)",
        },
        "60%": {
          opacity: "1",
        },
        to: {
          opacity: "1",
          translate: "0 0",
        },
      },
      // The panel carries its own background past its edge, so an overdrag
      // that pushes it beyond the screen never opens a gap onto the page.
      '[data-slot="drawer-content"]::after': {
        content: '""',
        position: "absolute",
        background: "inherit",
      },
      '[data-slot="drawer-content"][data-side="bottom"]::after': {
        top: "100%",
        right: "0",
        left: "0",
        height: "200%",
      },
      '[data-slot="drawer-content"][data-side="top"]::after': {
        bottom: "100%",
        right: "0",
        left: "0",
        height: "200%",
      },
      '[data-slot="drawer-content"][data-side="left"]::after': {
        top: "0",
        right: "100%",
        bottom: "0",
        width: "200%",
      },
      '[data-slot="drawer-content"][data-side="right"]::after': {
        top: "0",
        bottom: "0",
        left: "100%",
        width: "200%",
      },
    },
  },
  {
    name: "credit-card",
    type: "registry:ui",
    title: "Credit Card",
    description:
      "A placeholder payment card with a contact plate, a number and an aurora drifting under the face.",
    registryDependencies: ["utils", "use-in-viewport"],
    files: [
      {
        path: "loomui/credit-card.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-in-out-cubic": EASE_IN_OUT_CUBIC,
        "animate-aurora-drift":
          "aurora-drift 18s var(--ease-in-out-cubic) infinite",
      },
    },
    css: {
      "@keyframes aurora-drift": {
        "0%, 100%": {
          transform: "translate(0%, 0%) scale(1)",
        },
        "33%": {
          transform: "translate(26%, -22%) scale(1.35)",
        },
        "66%": {
          transform: "translate(-24%, 18%) scale(0.75)",
        },
      },
    },
  },
  {
    name: "shimmer-skeleton",
    type: "registry:ui",
    title: "Shimmer Skeleton",
    description:
      "A placeholder block with a shimmer that passes across it while the real thing loads.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/shimmer-skeleton.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "animate-skeleton-shimmer":
          "skeleton-shimmer var(--shimmer-duration, 1600ms) linear var(--shimmer-delay, 0ms) infinite",
      },
    },
    css: {
      "@keyframes skeleton-shimmer": {
        from: {
          transform: "translateX(-100%)",
        },
        to: {
          transform: "translateX(100%)",
        },
      },
    },
  },
  {
    name: "card-stack",
    type: "registry:ui",
    title: "Card Stack",
    description:
      "Cards that pin one behind another as the page scrolls, each settling behind the next.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/card-stack.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "image-trail",
    type: "registry:ui",
    title: "Image Trail",
    description:
      "Images dropped along the pointer's path, spaced by distance travelled rather than by time.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/image-trail.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
        "animate-trail-fade":
          "trail-fade var(--trail-duration, 900ms) var(--ease-out-quart) forwards",
      },
    },
    css: {
      "@keyframes trail-fade": {
        "0%": {
          opacity: "0",
          transform: "scale(0.7) rotate(0deg)",
        },
        "14%": {
          opacity: "1",
          transform: "scale(1) rotate(var(--trail-tilt, 0deg))",
        },
        "70%": {
          opacity: "1",
        },
        "100%": {
          opacity: "0",
          transform: "scale(0.86) rotate(var(--trail-tilt, 0deg))",
        },
      },
    },
  },
  {
    name: "bento-grid",
    type: "registry:ui",
    title: "Bento Grid",
    description:
      "A grid of tiles of different sizes that arrive one after another when the grid is reached.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/bento-grid.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
        "animate-bento-rise":
          "bento-rise 360ms var(--ease-out-quart) var(--bento-delay, 0ms) both",
      },
    },
    css: {
      "@keyframes bento-rise": {
        from: {
          opacity: "0",
          transform: "translateY(14px) scale(0.98)",
        },
        to: {
          opacity: "1",
          transform: "translateY(0) scale(1)",
        },
      },
    },
  },
  {
    name: "terminal",
    type: "registry:ui",
    title: "Terminal",
    description:
      "A window that types its commands out and prints their output a beat later.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/terminal.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
        "animate-caret-blink": "caret-blink 1.1s steps(2, jump-none) infinite",
        "animate-terminal-print":
          "terminal-print 240ms var(--ease-out-quart) both",
      },
    },
    css: {
      "@keyframes caret-blink": {
        "0%, 100%": {
          opacity: "1",
        },
        "50%": {
          opacity: "0",
        },
      },
      "@keyframes terminal-print": {
        from: {
          opacity: "0",
          transform: "translateY(3px)",
        },
        to: {
          opacity: "1",
          transform: "translateY(0)",
        },
      },
    },
  },
  {
    name: "unfold-list",
    type: "registry:ui",
    title: "Unfold List",
    description:
      "A disclosure list whose panels turn down onto the page from their top edge.",
    registryDependencies: ["utils"],
    files: [
      {
        path: "loomui/unfold-list.tsx",
        type: "registry:ui",
      },
    ],
    cssVars: {
      theme: {
        "ease-out-quart": EASE_OUT_QUART,
      },
    },
  },
]

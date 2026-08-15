"use client"

import * as React from "react"

import { FlipCard } from "@/registry/loomui/flip-card"

/** Fixed order rather than shuffled, so the server and the client agree. */
const DECK = ["🫐", "🍑", "🍑", "🫐"]
const MISS_DELAY = 700
/** The card's own turn, so the match ring waits for both cards to land. */
const FLIP_MS = 480

const FACE =
  "grid size-24 place-items-center rounded-xl border text-3xl transition-colors"

export default function FlipCardDemo() {
  const [faceUp, setFaceUp] = React.useState<number[]>([])
  const [matched, setMatched] = React.useState<number[]>([])
  // Matched cards that have finished turning. The ring waits for the turn so
  // it lands on a card that is already face up, not on one mid-flight.
  const [landed, setLanded] = React.useState<number[]>([])
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const ring = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(
    () => () => {
      clearTimeout(timer.current)
      clearTimeout(ring.current)
    },
    []
  )

  const reveal = (index: number) => {
    if (
      faceUp.length === 2 ||
      faceUp.includes(index) ||
      matched.includes(index)
    ) {
      return
    }

    const next = [...faceUp, index]
    setFaceUp(next)

    if (next.length < 2) {
      return
    }

    const [first, second] = next
    if (DECK[first] === DECK[second]) {
      setMatched((current) => [...current, first, second])
      setFaceUp([])
      ring.current = setTimeout(
        () => setLanded((current) => [...current, first, second]),
        FLIP_MS
      )
      return
    }

    timer.current = setTimeout(() => setFaceUp([]), MISS_DELAY)
  }

  const reset = () => {
    clearTimeout(timer.current)
    clearTimeout(ring.current)
    setFaceUp([])
    setMatched([])
    setLanded([])
  }

  const won = landed.length === DECK.length

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="grid grid-cols-2 gap-3">
        {DECK.map((emoji, index) => (
          <FlipCard
            key={index}
            flipped={faceUp.includes(index) || matched.includes(index)}
            onClick={() => reveal(index)}
            aria-label={`Card ${index + 1}`}
            front={
              <span
                className={`${FACE} bg-card text-muted-foreground/60 text-xl`}
              >
                ?
              </span>
            }
            back={
              <span
                className={`${FACE} bg-card ${
                  landed.includes(index) ? "border-accent" : ""
                }`}
              >
                {emoji}
              </span>
            }
          />
        ))}
      </div>

      {won ? (
        <button
          type="button"
          onClick={reset}
          className="text-muted-foreground hover:text-foreground cursor-pointer text-xs underline underline-offset-4"
        >
          Both pairs. Play again
        </button>
      ) : (
        <p className="text-muted-foreground text-xs">Find both pairs</p>
      )}
    </div>
  )
}

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { ConfettiButton } from "@/registry/loomui/confetti-button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/registry/loomui/drawer"
import { IconMorph } from "@/registry/loomui/icon-morph"
import { ProgressRing } from "@/registry/loomui/progress-ring"
import { UnfoldItem, UnfoldList } from "@/registry/loomui/unfold-list"

/**
 * A setup checklist that finishes with a drawer.
 *
 * Mixed pace on purpose. Ticking a step is something a person does several
 * times in a row, so it stays at the UI step. Finishing happens once, which is
 * the one moment worth spending motion on.
 */

const STEPS = [
  {
    id: "account",
    title: "Create your workspace",
    body: "Pick a name and a URL. Both can be changed later, and the URL keeps redirecting from the old one.",
  },
  {
    id: "team",
    title: "Invite your team",
    body: "Anyone with a matching email domain can join without an invite. Everyone else needs one.",
  },
  {
    id: "connect",
    title: "Connect a repository",
    body: "Read access is enough. loom never writes to a branch you have not named.",
  },
  {
    id: "deploy",
    title: "Ship your first change",
    body: "Push to the branch you connected. The first build usually takes about a minute.",
  },
]

export default function OnboardingFlow() {
  const [done, setDone] = React.useState<string[]>(["account"])
  const complete = done.length === STEPS.length
  const percent = Math.round((done.length / STEPS.length) * 100)

  const toggle = (id: string) =>
    setDone((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id]
    )

  return (
    <div className="bg-background min-h-svh">
      <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-16">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold">Get set up</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {complete
                ? "Everything is connected. Nothing left to do here."
                : `${done.length} of ${STEPS.length} done. Pick up wherever you left off.`}
            </p>
          </div>

          {/* The ring is the only place the count is shown as a shape, which
              is what makes progress readable without reading. */}
          <ProgressRing
            value={percent}
            size={72}
            label="Setup progress"
            className="shrink-0"
          />
        </div>

        <div className="mt-8 space-y-2">
          {STEPS.map((step) => {
            const ticked = done.includes(step.id)

            return (
              <div
                key={step.id}
                className="border-border bg-card flex items-start gap-3 rounded-xl border p-4"
              >
                <button
                  type="button"
                  onClick={() => toggle(step.id)}
                  aria-pressed={ticked}
                  aria-label={
                    ticked
                      ? `Mark ${step.title} undone`
                      : `Mark ${step.title} done`
                  }
                  className={cn(
                    "ease-out-quart mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-150",
                    ticked
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-muted-foreground/40"
                  )}
                >
                  {/* One shape the whole way, rather than swapping an empty
                      circle for a tick. Faded out while undone, because the
                      shape it morphs from is a chevron and a chevron sitting
                      in an empty checkbox reads as a control, not a state. */}
                  <IconMorph
                    set="chevron"
                    active={ticked}
                    className={cn(
                      "ease-out-quart size-3 transition-opacity duration-150",
                      ticked ? "opacity-100" : "opacity-0"
                    )}
                  />
                </button>

                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium transition-opacity duration-150",
                      ticked && "text-muted-foreground line-through"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm text-pretty">
                    {step.body}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Drawer>
            <DrawerTrigger asChild>
              <button
                type="button"
                className="bg-primary text-primary-foreground ease-out-quart rounded-lg px-4 py-3 text-sm font-medium transition-transform duration-150 active:scale-[0.97]"
              >
                What happens next
              </button>
            </DrawerTrigger>
            <DrawerContent side="bottom" size="28rem">
              <div className="mx-auto w-full max-w-lg px-5 pt-2 pb-8">
                <h2 className="text-lg font-semibold">What happens next</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  The questions people ask at this point, in the order they ask
                  them.
                </p>

                <UnfoldList type="single" className="mt-5">
                  <UnfoldItem value="billing" title="When does billing start?">
                    Not until you invite a second person. Solo workspaces stay
                    free for as long as you use them.
                  </UnfoldItem>
                  <UnfoldItem value="undo" title="Can I undo a deploy?">
                    Every build is kept, and rolling back is one click from the
                    deployment list. Nothing is deleted for thirty days.
                  </UnfoldItem>
                  <UnfoldItem value="limits" title="What are the limits?">
                    No cap on builds. Bandwidth is metered, and you are told at
                    eighty percent rather than at the moment it runs out.
                  </UnfoldItem>
                </UnfoldList>
              </div>
            </DrawerContent>
          </Drawer>

          {/* The one celebration on the page, and only once there is something
              to celebrate. Nothing is thrown until every step is ticked. */}
          <ConfettiButton
            disabled={!complete}
            count={complete ? 28 : 0}
            spread={120}
            className={cn(
              "ease-out-quart rounded-lg px-4 py-3 text-sm font-medium transition-opacity duration-150",
              complete
                ? "bg-accent text-accent-foreground"
                : "border-border text-muted-foreground cursor-not-allowed border"
            )}
          >
            Finish setup
          </ConfettiButton>
        </div>
      </div>
    </div>
  )
}

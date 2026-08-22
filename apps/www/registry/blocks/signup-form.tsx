"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { ConfettiButton } from "@/registry/loomui/confetti-button"
import { IconMorph } from "@/registry/loomui/icon-morph"
import { ProgressRing } from "@/registry/loomui/progress-ring"
import { UnfoldItem, UnfoldList } from "@/registry/loomui/unfold-list"

/**
 * A sign-up screen with a password meter that springs.
 *
 * The ring is driven by a spring rather than a transition, so typing a long
 * password does not queue five animations behind each other: each keystroke
 * retargets the one that is already running and carries its velocity into the
 * next. Strength is also named, never colour alone.
 */

const RULES = [
  {
    id: "length",
    label: "12 characters or more",
    test: (v: string) => v.length >= 12,
  },
  {
    id: "case",
    label: "Upper and lower case",
    test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { id: "number", label: "A number", test: (v: string) => /\d/.test(v) },
  { id: "symbol", label: "A symbol", test: (v: string) => /[^\w\s]/.test(v) },
]

const STRENGTH = ["Too short", "Weak", "Fair", "Good", "Strong"]

function Field({
  id,
  label,
  hint,
  type = "text",
  autoComplete,
  placeholder,
  value,
  onChange,
  children,
}: {
  id: string
  label: string
  hint?: string
  type?: string
  autoComplete?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  children?: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {hint ? (
          <span className="text-muted-foreground text-xs">{hint}</span>
        ) : null}
      </div>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          // 16px, so iOS does not zoom the page on focus.
          className={cn(
            "border-input bg-background ease-out-quart w-full rounded-lg border px-3 py-2.5 text-base transition-colors duration-150",
            "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:outline-none",
            children && "pr-11"
          )}
        />
        {children}
      </div>
    </div>
  )
}

export default function SignupForm() {
  const [password, setPassword] = React.useState("")
  const [visible, setVisible] = React.useState(false)

  const passed = RULES.filter((rule) => rule.test(password))
  const score = passed.length
  const percent = (score / RULES.length) * 100
  const ready = score === RULES.length

  return (
    <div className="bg-background min-h-svh">
      <div className="mx-auto w-full max-w-lg px-6 py-12 sm:py-16">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Free while it is just you. No card until you invite someone.
        </p>

        <form
          onSubmit={(event) => event.preventDefault()}
          className="mt-8 space-y-5"
        >
          <Field
            id="name"
            label="Full name"
            autoComplete="name"
            placeholder="Ada Whitfield"
          />

          <Field
            id="email"
            label="Work email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            hint="We match your team by domain"
          />

          <div>
            <Field
              id="password"
              label="Password"
              type={visible ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={password}
              onChange={setPassword}
            >
              {/* A real eye rather than a morph. IconMorph carries four shapes and
                  none of them is an eye, and a chevron in a password field
                  reads as a control that goes somewhere. */}
              <button
                type="button"
                onClick={() => setVisible((on) => !on)}
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                  aria-hidden
                >
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                  {visible ? <path d="m3 3 18 18" /> : null}
                </svg>
              </button>
            </Field>

            {/* Strength is named as well as drawn. A ring alone asks the reader
                to guess what a three-quarter ring means. */}
            <div className="mt-4 flex items-center gap-4">
              <ProgressRing
                value={percent}
                size={56}
                label="Password strength"
                className="shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium">{STRENGTH[score]}</p>
                <ul className="mt-1.5 space-y-1">
                  {RULES.map((rule) => {
                    const ok = rule.test(password)
                    return (
                      <li
                        key={rule.id}
                        className={cn(
                          "flex items-center gap-1.5 text-xs transition-colors duration-150",
                          ok ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {/* A dot until the rule is met, then the tick morphs
                            in over it. The shape IconMorph starts from is a
                            chevron, and a row of faint chevrons reads as a
                            list of links. */}
                        <span className="relative grid size-3 shrink-0 place-items-center">
                          <span
                            aria-hidden
                            className={cn(
                              "bg-muted-foreground/40 ease-out-quart absolute size-1.5 rounded-full transition-opacity duration-150",
                              ok ? "opacity-0" : "opacity-100"
                            )}
                          />
                          <IconMorph
                            set="chevron"
                            active={ok}
                            className={cn(
                              "text-accent ease-out-quart size-3 transition-opacity duration-150",
                              ok ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </span>
                        {rule.label}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>

          <ConfettiButton
            type="submit"
            disabled={!ready}
            count={ready ? 30 : 0}
            spread={130}
            className={cn(
              "ease-out-quart w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150",
              ready
                ? "bg-accent text-accent-foreground"
                : "border-border text-muted-foreground cursor-not-allowed border"
            )}
          >
            {ready ? "Create account" : "Meet every rule to continue"}
          </ConfettiButton>
        </form>

        <div className="mt-10">
          <h2 className="text-sm font-medium">Before you do</h2>
          <UnfoldList type="single" className="mt-3">
            <UnfoldItem value="data" title="What happens to my data?">
              It stays in the region you pick at setup and is never used to
              train anything. Export or delete all of it from the account page,
              any time, without asking us.
            </UnfoldItem>
            <UnfoldItem value="team" title="Can I move this to a team later?">
              Yes. A personal workspace turns into a team workspace without
              moving projects, and every URL keeps working.
            </UnfoldItem>
            <UnfoldItem value="billing" title="When does billing start?">
              When you invite a second person. Nothing before that, and you are
              told the day it changes.
            </UnfoldItem>
          </UnfoldList>
        </div>

        <p className="text-muted-foreground mt-8 text-center text-sm">
          Already have an account?{" "}
          <a
            href="#login"
            className="text-foreground underline underline-offset-4"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}

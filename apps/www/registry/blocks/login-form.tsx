"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { IconMorph } from "@/registry/loomui/icon-morph"
import { LightCurtain } from "@/registry/loomui/light-curtain"
import { RippleButton } from "@/registry/loomui/ripple-button"
import { Spool, SpoolItem } from "@/registry/loomui/spool"
import { WeaveText } from "@/registry/loomui/weave-text"

/**
 * A sign-in screen.
 *
 * The submit button is the whole idea. Rather than swapping a label for a
 * spinner and then for a tick, the shape changes to fit whatever it is holding,
 * so idle, working and done read as one control moving through three states
 * instead of three controls taking turns.
 */

type Status = "idle" | "working" | "done"

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  placeholder,
  children,
}: {
  id: string
  label: string
  type?: string
  autoComplete?: string
  placeholder?: string
  /** Anything pinned inside the right edge of the input. */
  children?: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
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

export default function LoginForm() {
  const [status, setStatus] = React.useState<Status>("idle")
  const [visible, setVisible] = React.useState(false)
  const timers = React.useRef<number[]>([])

  React.useEffect(
    () => () => timers.current.forEach((timer) => window.clearTimeout(timer)),
    []
  )

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (status !== "idle") return

    setStatus("working")
    timers.current = [
      window.setTimeout(() => setStatus("done"), 1200),
      window.setTimeout(() => setStatus("idle"), 3200),
    ]
  }

  return (
    <div className="bg-background grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Use the email you were invited with.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
            />

            <Field
              id="password"
              label="Password"
              type={visible ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-accent size-4 rounded"
                  defaultChecked
                />
                Keep me signed in
              </label>
              <a
                href="#reset"
                className="hover:text-accent text-sm underline underline-offset-4"
              >
                Forgot password
              </a>
            </div>

            {/* The shape follows the state. `w-full` on the wrapper rather than
                the spool, because the spool measures its own natural width to
                animate from and a stretched one would measure the stretch. */}
            <div className="flex w-full justify-center pt-1">
              <RippleButton
                type="submit"
                disabled={status !== "idle"}
                className="rounded-full"
              >
                <Spool
                  value={status}
                  className="bg-primary text-primary-foreground border-transparent shadow-none"
                >
                  <SpoolItem value="idle" className="px-6 py-3">
                    <span className="text-sm font-medium">Sign in</span>
                  </SpoolItem>

                  <SpoolItem value="working" className="px-5 py-3">
                    <span className="border-primary-foreground/30 border-t-primary-foreground size-4 animate-spin rounded-full border-2 motion-reduce:animate-none" />
                    <span className="text-sm font-medium">Checking</span>
                  </SpoolItem>

                  <SpoolItem value="done" className="px-5 py-3">
                    <span className="bg-primary-foreground/20 grid size-5 place-items-center rounded-full">
                      <IconMorph set="chevron" active className="size-3" />
                    </span>
                    <span className="text-sm font-medium">Welcome back</span>
                  </SpoolItem>
                </Spool>
              </RippleButton>
            </div>
          </form>

          <p className="text-muted-foreground mt-8 text-center text-sm">
            No account?{" "}
            <a
              href="#signup"
              className="text-foreground underline underline-offset-4"
            >
              Create one
            </a>
          </p>
        </div>
      </div>

      {/* The panel is decoration and says so: hidden below `lg`, where the
          form is the only thing worth the width. */}
      <div className="relative hidden overflow-hidden border-l lg:block">
        <LightCurtain intensity={0.32} reach="70%" blur={72} />
        <div className="relative flex h-full flex-col justify-end p-12">
          <blockquote className="max-w-md text-balance">
            <p className="text-2xl font-semibold">
              The pieces people{" "}
              <WeaveText className="font-semibold">actually remember</WeaveText>{" "}
              are the ones nobody had time to build.
            </p>
            <footer className="text-muted-foreground mt-4 text-sm">
              Ada Whitfield, staff engineer
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  )
}

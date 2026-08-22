"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { IconMorph } from "@/registry/loomui/icon-morph"
import { LightCurtain } from "@/registry/loomui/light-curtain"
import { RippleButton } from "@/registry/loomui/ripple-button"
import { ShakeField } from "@/registry/loomui/shake-field"
import { Spool, SpoolItem } from "@/registry/loomui/spool"
import { WeaveText } from "@/registry/loomui/weave-text"

/**
 * A sign-in screen that can fail.
 *
 * Two pieces do the work. The submit button changes shape through idle,
 * working and done rather than swapping a label for a spinner, and a refusal
 * shakes the field it belongs to while opening the reason underneath it.
 *
 * The form arrives in order rather than all at once. Four rows landing
 * together read mechanical; a beat between them reads as a wave.
 */

/** The one account that works, so the failure path is reachable. */
const ACCOUNT = { email: "ada@acme.com", password: "loomloomloom" }

type Status = "idle" | "working" | "done"

const EYE = "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"

function Row({
  delay,
  children,
}: {
  /** Milliseconds after the row above it. */
  delay: number
  children: React.ReactNode
}) {
  return (
    <div className="animate-rise" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export default function LoginForm() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [visible, setVisible] = React.useState(false)
  const [status, setStatus] = React.useState<Status>("idle")
  const [errors, setErrors] = React.useState<{
    email?: string
    password?: string
  }>({})
  const [attempt, setAttempt] = React.useState(0)
  const timers = React.useRef<number[]>([])

  React.useEffect(
    () => () => timers.current.forEach((timer) => window.clearTimeout(timer)),
    []
  )

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (status !== "idle") return

    // Bumped on every attempt, so the same message twice still answers twice.
    setAttempt((count) => count + 1)

    const next: typeof errors = {}
    if (!email.includes("@")) {
      next.email = "That does not look like an email address."
    } else if (email !== ACCOUNT.email) {
      next.email = "No account for that address."
    }
    if (!next.email && password !== ACCOUNT.password) {
      next.password = "That password does not match."
    }

    setErrors(next)
    if (next.email || next.password) return

    setStatus("working")
    timers.current = [
      window.setTimeout(() => setStatus("done"), 1100),
      window.setTimeout(() => setStatus("idle"), 3200),
    ]
  }

  const inputClass = (invalid?: string) =>
    cn(
      // 16px, so iOS does not zoom the page on focus.
      "border-input bg-background ease-out-quart w-full rounded-lg border px-3 py-2.5 text-base transition-[border-color,box-shadow] duration-150",
      "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:outline-none",
      invalid && "border-destructive"
    )

  return (
    <div className="bg-background grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Row delay={0}>
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Use{" "}
              <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                {ACCOUNT.email}
              </code>{" "}
              with{" "}
              <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                {ACCOUNT.password}
              </code>
              , or get it wrong on purpose.
            </p>
          </Row>

          {/* `noValidate`, because the browser's own bubble fires before the
              submit handler does and the field never gets to say anything.
              Validation is ours; the input types stay for the keyboards they
              bring up on a phone. */}
          <form noValidate onSubmit={submit} className="mt-8 space-y-4">
            <Row delay={60}>
              <ShakeField error={errors.email} attempt={attempt}>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  aria-invalid={errors.email ? true : undefined}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setErrors((current) => ({ ...current, email: undefined }))
                  }}
                  placeholder="you@company.com"
                  className={cn("mt-1.5", inputClass(errors.email))}
                />
              </ShakeField>
            </Row>

            <Row delay={120}>
              <ShakeField error={errors.password} attempt={attempt}>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    type={visible ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    aria-invalid={errors.password ? true : undefined}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setErrors((current) => ({
                        ...current,
                        password: undefined,
                      }))
                    }}
                    placeholder="••••••••"
                    className={cn("pr-11", inputClass(errors.password))}
                  />
                  {/* A real eye. IconMorph carries four shapes and none of them
                      is one, and a chevron in a password field reads as a
                      control that goes somewhere. */}
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
                      <path d={EYE} />
                      <circle cx="12" cy="12" r="3" />
                      {visible ? <path d="m3 3 18 18" /> : null}
                    </svg>
                  </button>
                </div>
              </ShakeField>
            </Row>

            <Row delay={180}>
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
            </Row>

            <Row delay={240}>
              {/* `justify-center` on the wrapper rather than a width on the
                  spool. The spool measures its own natural size to animate
                  from, and a stretched one would measure the stretch. */}
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
            </Row>
          </form>

          <Row delay={300}>
            <p className="text-muted-foreground mt-8 text-center text-sm">
              No account?{" "}
              <a
                href="#signup"
                className="text-foreground underline underline-offset-4"
              >
                Create one
              </a>
            </p>
          </Row>
        </div>
      </div>

      {/* Decoration, and it says so: hidden below `lg`, where the form is the
          only thing worth the width. */}
      <div className="relative hidden overflow-hidden border-l lg:block">
        <LightCurtain intensity={0.32} reach="70%" blur={72} />
        <div className="relative flex h-full flex-col justify-end p-12">
          <blockquote className="animate-rise max-w-md text-balance [animation-delay:200ms]">
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

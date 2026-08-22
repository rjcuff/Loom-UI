"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { ConfettiButton } from "@/registry/loomui/confetti-button"
import { ShakeField } from "@/registry/loomui/shake-field"
import { UnfoldItem, UnfoldList } from "@/registry/loomui/unfold-list"

/**
 * A sign-up screen with a four segment password meter.
 *
 * The meter is four segments because there are four rules, so the shape says
 * how much is left without anyone reading a percentage. Strength is named as
 * well as drawn, and only the rules still outstanding are written out.
 */

/** Worded to drop into "Still needs 12 characters and a symbol." */
const RULES = [
  { id: "length", short: "12 characters", test: (v: string) => v.length >= 12 },
  {
    id: "case",
    short: "upper and lower case",
    test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v),
  },
  { id: "number", short: "a number", test: (v: string) => /\d/.test(v) },
  { id: "symbol", short: "a symbol", test: (v: string) => /[^\w\s]/.test(v) },
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
  invalid,
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
  invalid?: boolean
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
          aria-invalid={invalid ? true : undefined}
          // 16px, so iOS does not zoom the page on focus.
          className={cn(
            "border-input bg-background ease-out-quart w-full rounded-lg border px-3 py-2.5 text-base transition-[border-color,box-shadow] duration-150",
            "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:outline-none",
            invalid && "border-destructive",
            children && "pr-11"
          )}
        />
        {children}
      </div>
    </div>
  )
}

/** One row of the form, landing a beat after the one above it. */
function Row({
  delay,
  children,
}: {
  delay: number
  children: React.ReactNode
}) {
  return (
    <div className="animate-rise" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export default function SignupForm() {
  const [password, setPassword] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [visible, setVisible] = React.useState(false)
  const [emailError, setEmailError] = React.useState<string | null>(null)
  const [passwordError, setPasswordError] = React.useState<string | null>(null)
  const [attempt, setAttempt] = React.useState(0)

  // Free mail is the one refusal worth demonstrating: it is a real rule, and
  // it fires on a value that looks perfectly valid.
  const FREE = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com"]

  const check = (event: React.FormEvent) => {
    event.preventDefault()
    setAttempt((count) => count + 1)

    const domain = email.split("@")[1]?.toLowerCase()
    setEmailError(
      !domain
        ? "That does not look like an email address."
        : FREE.includes(domain)
          ? "Use your work address so we can match you to a team."
          : null
    )

    setPasswordError(
      passed.length === RULES.length
        ? null
        : "Your password does not meet every rule yet."
    )
  }

  const passed = RULES.filter((rule) => rule.test(password))
  const score = passed.length
  const unmet = RULES.filter((rule) => !rule.test(password)).map((r) => r.short)
  const missing =
    unmet.length === 0
      ? null
      : unmet.length === 1
        ? unmet[0]
        : `${unmet.slice(0, -1).join(", ")} and ${unmet[unmet.length - 1]}`
  const ready = score === RULES.length

  return (
    <div className="bg-background min-h-svh">
      <div className="mx-auto w-full max-w-lg px-6 py-12 sm:py-16">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Free while it is just you. No card until you invite someone.
        </p>

        {/* `noValidate` for the same reason the errors below exist: the
              browser's bubble fires first and says less. */}
        <form noValidate onSubmit={check} className="mt-8 space-y-5">
          <Row delay={60}>
            <Field
              id="name"
              label="Full name"
              autoComplete="name"
              placeholder="Ada Whitfield"
            />
          </Row>

          <Row delay={120}>
            <ShakeField error={emailError} attempt={attempt}>
              <Field
                id="email"
                label="Work email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                hint="Not a free mail address"
                value={email}
                onChange={(next) => {
                  setEmail(next)
                  setEmailError(null)
                }}
                invalid={Boolean(emailError)}
              />
            </ShakeField>
          </Row>

          <Row delay={180}>
            <ShakeField error={passwordError} attempt={attempt}>
              <Field
                id="password"
                label="Password"
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(next) => {
                  setPassword(next)
                  setPasswordError(null)
                }}
                invalid={Boolean(passwordError)}
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

              {/* Four segments, because there are four rules. The shape says
                  how many are left without anyone reading a percentage off a
                  ring, and only what is still missing is written out: four
                  permanent ticks are four things to read every time, and three
                  of them are already done. */}
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <div className="flex min-w-0 flex-1 gap-1">
                    {RULES.map((rule, position) => (
                      <span
                        key={rule.id}
                        className={cn(
                          "ease-out-quart h-1 flex-1 rounded-full transition-colors duration-200",
                          position < score ? "bg-accent" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-medium",
                      ready ? "text-accent" : "text-muted-foreground"
                    )}
                  >
                    {STRENGTH[score]}
                  </span>
                </div>

                {missing ? (
                  <p className="text-muted-foreground mt-2 text-xs">
                    Still needs {missing}.
                  </p>
                ) : null}
              </div>
            </ShakeField>
          </Row>

          <Row delay={240}>
            {/* Never disabled. A greyed-out button says no without saying
                why, and the reason is exactly what the field underneath is
                there to give. Pressing it is how you find out. */}
            <ConfettiButton
              type="submit"
              count={ready ? 30 : 0}
              spread={130}
              className={cn(
                "ease-out-quart w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150",
                ready
                  ? "bg-accent text-accent-foreground"
                  : "border-border hover:bg-muted border"
              )}
            >
              Create account
            </ConfettiButton>
          </Row>
        </form>

        <div className="animate-rise mt-10 [animation-delay:300ms]">
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

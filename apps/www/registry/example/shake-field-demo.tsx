"use client"

import * as React from "react"

import { ShakeField } from "@/registry/loomui/shake-field"

export default function ShakeFieldDemo() {
  const [value, setValue] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [attempt, setAttempt] = React.useState(0)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setAttempt((n) => n + 1)
    setError(
      value.includes("@") ? null : "That does not look like an email address."
    )
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-4">
      <ShakeField error={error} attempt={attempt}>
        <label htmlFor="shake-demo-email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="shake-demo-email"
          type="email"
          value={value}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            setValue(event.target.value)
            setError(null)
          }}
          placeholder="you@company.com"
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/40 aria-invalid:border-destructive mt-1.5 w-full rounded-lg border px-3 py-2.5 text-base focus-visible:ring-2 focus-visible:outline-none"
        />
      </ShakeField>

      <button
        type="submit"
        className="bg-primary text-primary-foreground ease-out-quart w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-transform duration-150 active:scale-[0.97]"
      >
        Submit
      </button>

      <p className="text-muted-foreground text-xs">
        Submit an address with no <code className="font-mono">@</code> in it.
        Submitting the same wrong value again shakes again.
      </p>
    </form>
  )
}

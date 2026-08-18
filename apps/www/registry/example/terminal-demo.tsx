import {
  Terminal,
  TerminalCommand,
  TerminalOutput,
} from "@/registry/loomui/terminal"

export default function TerminalDemo() {
  return (
    <Terminal title="~/acme-app" className="max-w-lg">
      <TerminalCommand>npx shadcn@latest add @loomui/terminal</TerminalCommand>
      <TerminalOutput delay={420}>Checking registry...</TerminalOutput>
      <TerminalOutput delay={520}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="text-accent inline-block size-3"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>{" "}
        Installed terminal.tsx
      </TerminalOutput>
      <TerminalOutput delay={260}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="text-accent inline-block size-3"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>{" "}
        Updated app/globals.css
      </TerminalOutput>
      <TerminalCommand>pnpm dev</TerminalCommand>
      <TerminalOutput delay={380}>
        ready on http://localhost:3000
      </TerminalOutput>
    </Terminal>
  )
}

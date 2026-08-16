import {
  Terminal,
  TerminalCommand,
  TerminalOutput,
} from "@/registry/loomui/terminal"

export default function TerminalDemo() {
  return (
    <Terminal title="~/acme-app" className="max-w-lg">
      <TerminalCommand>npx shadcn@latest add @loomui/terminal</TerminalCommand>
      <TerminalOutput delay={420}>Checking registry…</TerminalOutput>
      <TerminalOutput delay={520}>
        <span className="text-accent">✔</span> Installed terminal.tsx
      </TerminalOutput>
      <TerminalOutput delay={260}>
        <span className="text-accent">✔</span> Updated app/globals.css
      </TerminalOutput>
      <TerminalCommand>pnpm dev</TerminalCommand>
      <TerminalOutput delay={380}>
        ready on http://localhost:3000
      </TerminalOutput>
    </Terminal>
  )
}

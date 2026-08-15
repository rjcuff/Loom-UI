import { LogoLoom } from "@/registry/loomui/logo-loom"

const LOGOS = ["Northwind", "Contoso", "Fabrikam", "Tailspin", "Proseware"]

export default function LogoLoomDemo() {
  return (
    <LogoLoom className="w-full max-w-2xl" repeat>
      {LOGOS.map((logo) => (
        <span
          key={logo}
          className="text-muted-foreground text-lg font-semibold tracking-tight"
        >
          {logo}
        </span>
      ))}
    </LogoLoom>
  )
}

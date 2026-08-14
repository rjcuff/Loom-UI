import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-muted-foreground font-mono text-sm">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Nothing woven here
      </h1>
      <Button asChild variant="outline">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  )
}

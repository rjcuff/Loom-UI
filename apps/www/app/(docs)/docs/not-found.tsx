import Link from "next/link"

import { DOCS_ENTRY } from "@/config/docs"
import { Button } from "@/components/ui/button"

export default function DocsNotFound() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">That page has not been woven yet.</p>
      <Button asChild variant="outline">
        <Link href={DOCS_ENTRY}>Back to the docs</Link>
      </Button>
    </div>
  )
}

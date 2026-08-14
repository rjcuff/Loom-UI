import { DocsNav } from "@/components/docs-nav"

export function DocsSidebar() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] shrink-0 overflow-y-auto py-8 pl-6 lg:block">
      <DocsNav />
    </aside>
  )
}

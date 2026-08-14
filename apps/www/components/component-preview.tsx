import * as React from "react"

import { getRegistryComponent } from "@/lib/registry"
import { ComponentPreviewTabs } from "@/components/component-preview-tabs"
import { ComponentSource } from "@/components/component-source"

interface ComponentPreviewProps {
  /** Registry item name, usually `<component>-demo`. */
  name: string
  align?: "start" | "center" | "end"
  hideCode?: boolean
  className?: string
}

export function ComponentPreview({
  name,
  className,
  align = "center",
  hideCode = false,
}: ComponentPreviewProps) {
  const Component = getRegistryComponent(name)

  if (!Component) {
    return (
      <p className="text-muted-foreground text-sm">
        <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">
          {name}
        </code>{" "}
        is not in the registry. Add it to registry-examples.ts and run{" "}
        <code className="font-mono">pnpm build:registry</code>.
      </p>
    )
  }

  return (
    <ComponentPreviewTabs
      className={className}
      align={align}
      hideCode={hideCode}
      component={<Component />}
      source={
        <ComponentSource
          name={name}
          title={`components/${name}.tsx`}
          collapsible={false}
        />
      }
    />
  )
}

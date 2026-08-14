"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ComponentPreviewTabs({
  className,
  align = "center",
  hideCode = false,
  component,
  source,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end"
  hideCode?: boolean
  component: React.ReactNode
  source: React.ReactNode
}) {
  return (
    <div className={cn("my-4", className)} {...props}>
      <Tabs defaultValue="preview" className="gap-3">
        {!hideCode ? (
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        ) : null}

        <TabsContent value="preview">
          <div
            className={cn(
              "border-border bg-surface flex min-h-[260px] w-full justify-center overflow-hidden rounded-xl border p-5 sm:min-h-[350px] sm:p-8",
              align === "start" && "items-start",
              align === "center" && "items-center",
              align === "end" && "items-end"
            )}
          >
            <React.Suspense
              fallback={
                <div className="text-muted-foreground flex items-center text-sm">
                  Loading preview
                </div>
              }
            >
              {component}
            </React.Suspense>
          </div>
        </TabsContent>

        <TabsContent value="code">
          <div className="[&_figure]:my-0 [&_pre]:max-h-[420px]">{source}</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import Link from "next/link"
import type { MDXComponents } from "mdx/types"

import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Callout } from "@/components/callout"
import { CodeBlock } from "@/components/code-block"
import { ComponentGrid } from "@/components/component-grid"
import { ComponentPreview } from "@/components/component-preview"
import { ComponentSource } from "@/components/component-source"
import { AccentPicker } from "@/components/theme/accent-picker"
import {
  DurationScale,
  EasingGallery,
  ElevationScale,
} from "@/components/theme/motion-tokens"
import { SwatchGrid } from "@/components/theme/swatch-grid"
import { TypeSpecimen, WeightSpecimen } from "@/components/theme/type-specimen"

export const mdxComponents: MDXComponents = {
  h1: ({ className, ...props }: React.ComponentProps<"h1">) => (
    <h1
      className={cn(
        "mt-2 scroll-m-20 text-3xl font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.ComponentProps<"h2">) => (
    <h2
      className={cn(
        "border-border mt-14 scroll-m-20 border-b pb-3 text-xl font-semibold tracking-tight first:mt-0",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3
      className={cn(
        "mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.ComponentProps<"h4">) => (
    <h4
      className={cn(
        "mt-6 scroll-m-20 text-base font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p className={cn("leading-7 not-first:mt-4", className)} {...props} />
  ),
  a: ({ className, ...props }: React.ComponentProps<"a">) => (
    <a
      className={cn(
        "hover:text-accent font-medium underline underline-offset-4",
        className
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.ComponentProps<"ul">) => (
    <ul
      className={cn("my-4 ml-6 list-disc [&>li]:mt-1.5", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.ComponentProps<"ol">) => (
    <ol
      className={cn("my-4 ml-6 list-decimal [&>li]:mt-1.5", className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className={cn(
        "border-accent text-muted-foreground mt-5 border-l-2 pl-5 italic",
        className
      )}
      {...props}
    />
  ),
  hr: (props: React.ComponentProps<"hr">) => (
    <hr className="border-border my-8" {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="my-5 w-full overflow-x-auto">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  ),
  tr: ({ className, ...props }: React.ComponentProps<"tr">) => (
    <tr
      className={cn("border-border border-b last:border-0", className)}
      {...props}
    />
  ),
  th: ({ className, ...props }: React.ComponentProps<"th">) => (
    <th
      className={cn(
        "px-3 py-2 text-left font-medium whitespace-nowrap [&[align=center]]:text-center",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <td
      className={cn("px-3 py-2 align-top [&_code]:text-xs", className)}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.ComponentProps<"code">) => (
    <code
      className={cn(
        "bg-muted relative rounded px-[0.35rem] py-[0.15rem] font-mono text-[0.85em]",
        // Code inside a highlighted block manages its own styling.
        "[[data-rehype-pretty-code-figure]_&]:bg-transparent [[data-rehype-pretty-code-figure]_&]:p-0",
        className
      )}
      {...props}
    />
  ),
  pre: CodeBlock,

  Step: ({ className, ...props }: React.ComponentProps<"h4">) => (
    <h4
      className={cn(
        "mt-6 scroll-m-20 text-base font-medium tracking-tight",
        className
      )}
      {...props}
    />
  ),
  Steps: ({ className, ...props }: React.ComponentProps<"div">) => (
    <div
      className={cn(
        "loom-steps border-border mt-6 ml-4 border-l pl-6",
        className
      )}
      {...props}
    />
  ),

  Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}
    />
  ),

  // Headings sit tight against whatever follows them, so tab groups need
  // their own breathing room in prose.
  Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => (
    <Tabs className={cn("mt-6 mb-2", className)} {...props} />
  ),
  TabsList,
  TabsTrigger,
  TabsContent: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsContent>) => (
    <TabsContent className={cn("mt-1", className)} {...props} />
  ),
  Callout,
  ComponentGrid,
  AccentPicker,
  SwatchGrid,
  TypeSpecimen,
  WeightSpecimen,
  ElevationScale,
  EasingGallery,
  DurationScale,
  ComponentPreview,
  ComponentSource,
}

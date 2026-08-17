import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"

import { siteConfig } from "@/config/site"
import { fontVariables } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"

import "@/styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  // No `template` here: every page sets its own absolute title so the tab
  // reads exactly as intended: "Loom UI" on the home page, "<Page> | React
  // Components & Effects" everywhere else.
  title: siteConfig.seoTitle,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
  creator: siteConfig.author.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@ryancuff_",
    images: [siteConfig.ogImage],
  },
  category: "Web Development",
  // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in the deploy environment to claim
  // the property in Search Console; the tag is left out entirely without it.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
    { media: "(prefers-color-scheme: dark)", color: "#16181c" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "text-foreground min-h-svh overscroll-none font-sans antialiased",
          fontVariables
        )}
      >
        {/* No `disableTransitionOnChange`: next-themes implements it by
            injecting `transition: none !important` on every element for the
            duration of the swap, which would kill the theme toggle's own icon
            animation at exactly the moment it should play. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

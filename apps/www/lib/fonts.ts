import { Inter, JetBrains_Mono } from "next/font/google"

import { cn } from "@/lib/utils"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const fontVariables = cn(fontSans.variable, fontMono.variable)

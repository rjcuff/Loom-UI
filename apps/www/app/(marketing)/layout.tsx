import { AnnouncementBanner } from "@/components/announcement-banner"
import { SiteFooter } from "@/components/site-footer"
import { MarketingHeader } from "@/components/site-header"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <AnnouncementBanner />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}

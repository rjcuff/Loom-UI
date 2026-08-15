import { StickerPeel } from "@/registry/loomui/sticker-peel"

const STICKERS = [
  { label: "Ships today", tone: "bg-accent text-accent-foreground" },
  { label: "One file", tone: "bg-card text-card-foreground border" },
  { label: "No deps", tone: "bg-primary text-primary-foreground" },
] as const

export default function StickerPeelDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      {STICKERS.map((sticker, index) => (
        <StickerPeel
          key={sticker.label}
          corner={index === 1 ? "top-right" : "bottom-right"}
          size="2.5rem"
          className="size-32 rounded-xl"
        >
          <div
            className={`grid h-full w-full place-items-center rounded-xl p-4 text-center text-sm font-medium ${sticker.tone}`}
          >
            {sticker.label}
          </div>
        </StickerPeel>
      ))}
    </div>
  )
}

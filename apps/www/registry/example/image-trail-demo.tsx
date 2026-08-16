import { ImageTrail } from "@/registry/loomui/image-trail"

/** Stock photography, so the demo shows what real sources look like. */
const IMAGES = [
  "https://picsum.photos/id/1015/400/400",
  "https://picsum.photos/id/1025/400/400",
  "https://picsum.photos/id/1039/400/400",
  "https://picsum.photos/id/1043/400/400",
  "https://picsum.photos/id/1062/400/400",
  "https://picsum.photos/id/1074/400/400",
]

export default function ImageTrailDemo() {
  return (
    <ImageTrail
      images={IMAGES}
      className="grid h-64 w-full max-w-2xl place-items-center rounded-xl border"
      imageClassName="size-24 rounded-xl"
    >
      <p className="text-muted-foreground pointer-events-none text-sm">
        Move the pointer across this panel.
      </p>
    </ImageTrail>
  )
}

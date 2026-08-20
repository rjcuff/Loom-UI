import { PhotoStamp } from "@/registry/loomui/photo-stamp"

/**
 * Stock photography at full size. The open state is the file's real size, so a
 * thumbnail-resolution source would arrive soft.
 */
const PHOTO = "https://picsum.photos/id/1015/1600/1200"

export default function PhotoStampDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <PhotoStamp
        src={PHOTO}
        alt="A river cutting through a valley"
        imageClassName="h-36 w-52"
      />
      <p className="text-muted-foreground text-xs">
        Click it. The photo you clicked is the photo that opens.
      </p>
    </div>
  )
}

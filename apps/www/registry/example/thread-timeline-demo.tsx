import {
  ThreadTimeline,
  ThreadTimelineItem,
} from "@/registry/loomui/thread-timeline"

const ENTRIES = [
  {
    meta: "March",
    title: "First thread",
    body: "One component, copied by hand, with the timings left as props.",
  },
  {
    meta: "May",
    title: "The registry",
    body: "Every component installable in a single command, keyframes included.",
  },
  {
    meta: "July",
    title: "Reduced motion",
    body: "Every animation given a resting state worth looking at.",
  },
  {
    meta: "August",
    title: "Sections",
    body: "Whole blocks, not just the pieces they are cut from.",
  },
]

export default function ThreadTimelineDemo() {
  return (
    <ThreadTimeline className="w-full max-w-md">
      {ENTRIES.map((entry, index) => (
        <ThreadTimelineItem
          key={entry.title}
          meta={entry.meta}
          title={entry.title}
          marker={index + 1}
        >
          {entry.body}
        </ThreadTimelineItem>
      ))}
    </ThreadTimeline>
  )
}

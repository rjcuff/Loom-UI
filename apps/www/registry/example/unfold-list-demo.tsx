import { UnfoldItem, UnfoldList } from "@/registry/loomui/unfold-list"

export default function UnfoldListDemo() {
  return (
    <UnfoldList defaultValue="own" className="w-full max-w-md">
      <UnfoldItem value="own" title="Do I own the code?">
        It lands in your repo as a plain file. Edit it, rename it, delete half
        of it. Nothing upstream is going to complain.
      </UnfoldItem>

      <UnfoldItem value="deps" title="What does it install?">
        The file, plus the tokens it needs. No animation library, no provider to
        wrap your app in, no bundle you have to defend at review.
      </UnfoldItem>

      <UnfoldItem value="motion" title="What about reduced motion?">
        Handled. Every component checks the preference itself and settles
        straight into its finished state.
      </UnfoldItem>
    </UnfoldList>
  )
}

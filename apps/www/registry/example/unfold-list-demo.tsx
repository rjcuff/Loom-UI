import { UnfoldItem, UnfoldList } from "@/registry/loomui/unfold-list"

export default function UnfoldListDemo() {
  return (
    <UnfoldList defaultValue="own" className="w-full max-w-md">
      <UnfoldItem value="own" title="Do I own the code?">
        Every component is copied into your project as a plain file. Edit it,
        rename it, delete it. Nothing upstream breaks.
      </UnfoldItem>

      <UnfoldItem value="deps" title="What does it install?">
        The file, and the tokens it needs in your stylesheet. No animation
        library and no provider to wrap your app in.
      </UnfoldItem>

      <UnfoldItem value="motion" title="What about reduced motion?">
        Each component checks the preference itself and settles straight into
        its finished state instead of animating into it.
      </UnfoldItem>
    </UnfoldList>
  )
}

"use client"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/loomui/drawer"

const BUTTON =
  "border-border bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/60 inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98]"

export default function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger className={BUTTON}>Open drawer</DrawerTrigger>

      <DrawerContent side="bottom">
        <DrawerHeader>
          <DrawerTitle>Thread settings</DrawerTitle>
          <DrawerDescription>
            Drag anywhere on the panel to send it away.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerClose className={`${BUTTON} mt-auto self-start`}>
          Done
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  )
}

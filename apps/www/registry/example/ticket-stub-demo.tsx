import { TicketStub } from "@/registry/loomui/ticket-stub"

export default function TicketStubDemo() {
  return (
    <TicketStub
      className="w-full max-w-lg"
      split={70}
      stub={
        <div className="flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
          <div className="text-muted-foreground text-[0.6rem] tracking-[0.2em] uppercase">
            Seat
          </div>
          <div className="text-xl font-semibold sm:text-2xl">14A</div>
        </div>
      }
    >
      <div className="p-4 sm:p-5">
        <div className="text-muted-foreground text-[0.6rem] tracking-[0.2em] uppercase">
          Boarding pass
        </div>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-xl font-semibold sm:text-2xl">LIS</span>
          <span className="text-muted-foreground text-sm">to</span>
          <span className="text-xl font-semibold sm:text-2xl">KIX</span>
        </div>
        <div className="text-muted-foreground mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
          <span>Gate B12</span>
          <span>Boards 10:42</span>
        </div>
      </div>
    </TicketStub>
  )
}

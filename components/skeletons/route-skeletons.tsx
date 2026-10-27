import { Skeleton } from "@/components/ui/skeleton"
import { PropertyCardSkeleton } from "@/components/property-card-skeleton"

// Route-level placeholders (used by loading.tsx files) so a tap on slow mobile
// data shows the shape of the next screen at once instead of a blank page.

const block = "border-3 border-foreground rounded-none"

function Announce() {
  return (
    <span role="status" className="sr-only">
      Loading
    </span>
  )
}

export function PageSkeleton() {
  return (
    <main className="container mx-auto space-y-6 px-4 py-8" aria-busy="true">
      <Announce />
      <Skeleton className="h-8 w-28 rounded-none" />
      <Skeleton className="h-10 w-3/4 rounded-none" />
      <Skeleton className="h-4 w-full max-w-xl rounded-none" />
      <Skeleton className="h-4 w-2/3 max-w-md rounded-none" />
      <div className="grid gap-4 pt-4 md:grid-cols-3">
        {["a", "b", "c"].map((k) => (
          <Skeleton key={k} className={`h-40 ${block}`} />
        ))}
      </div>
    </main>
  )
}

export function DashboardSkeleton() {
  return (
    <main className="min-h-screen pt-20 lg:ml-64" aria-busy="true">
      <Announce />
      <div className="space-y-6 p-4 lg:p-8">
        <Skeleton className="h-9 w-56 rounded-none" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {["a", "b", "c", "d"].map((k) => (
            <Skeleton key={k} className={`h-24 ${block}`} />
          ))}
        </div>
        <Skeleton className={`h-48 ${block}`} />
        <Skeleton className={`h-32 ${block}`} />
      </div>
    </main>
  )
}

export function ListSkeleton() {
  return (
    <main className="container mx-auto space-y-6 px-4 py-8" aria-busy="true">
      <Announce />
      <Skeleton className="h-10 w-64 rounded-none" />
      <Skeleton className={`h-12 w-full ${block}`} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {["a", "b", "c", "d", "e", "f"].map((k) => (
          <PropertyCardSkeleton key={k} />
        ))}
      </div>
    </main>
  )
}

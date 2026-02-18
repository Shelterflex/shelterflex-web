export default function Loading() {
  const thumbnails = [
    "thumb-1",
    "thumb-2",
    "thumb-3",
    "thumb-4",
    "thumb-5",
    "thumb-6",
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b-3 border-foreground bg-muted">
        <div className="container mx-auto px-4 py-4">
          <div className="h-6 w-32 bg-muted-foreground/20 animate-pulse" />
        </div>
      </div>
      
      <section className="border-b-3 border-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="aspect-16/10 border-3 border-foreground bg-muted animate-pulse shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]" />
            </div>
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-2">
              {thumbnails.map((id) => (
                <div
                  key={id}
                  className="aspect-square border-3 border-foreground bg-muted animate-pulse shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="h-10 w-64 bg-muted-foreground/20 animate-pulse mb-4" />
          <div className="h-6 w-48 bg-muted-foreground/20 animate-pulse" />
        </div>
      </section>
    </main>
  )
}

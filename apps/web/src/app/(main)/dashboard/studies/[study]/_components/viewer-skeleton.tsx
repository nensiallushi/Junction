export const ViewerSkeleton = () => (
  <div className="grid gap-4 lg:grid-cols-[44%_1fr]">
    <div className="flex flex-col gap-2">
      <div className="aspect-[4/5] w-full animate-pulse rounded-card border border-accent bg-card" />
      <div className="mx-auto h-3 w-64 animate-pulse rounded bg-accent" />
    </div>
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((card) => (
        <div
          key={card}
          className="flex flex-col gap-3 rounded-card border border-accent bg-card/70 p-4 shadow-card"
        >
          <div className="h-4 w-48 animate-pulse rounded bg-accent" />
          <div className="h-3 w-full animate-pulse rounded bg-accent" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-accent" />
        </div>
      ))}
    </div>
  </div>
);

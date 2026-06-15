import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder for data tables — skeleton rows, not a center spinner
 * (DESIGN.md: "loading (skeletons, not center spinners)").
 */
export function TableSkeleton({
  rows = 6,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center gap-4 border-b bg-muted/60 px-4 py-2.5">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className="h-4 flex-1"
                style={{ opacity: 1 - r * (0.5 / rows) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export function OverviewCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-5 2xl:gap-7.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <Skeleton className="size-11 rounded-full" />
              <div>
                <Skeleton className="mb-1.5 h-3 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
            <Skeleton className="h-4 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { useAnalytics } from "@/app/(home)/_hooks/useAnalytics";
import { DonutChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export function UsedDevices({
  timeFrame = "monthly",
  className,
}: PropsType) {
  const { data: analyticsData, loading } = useAnalytics();
  const data = analyticsData?.ordersChart || [];

  if (loading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 grid-rows-[auto_1fr] gap-9 rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
          className,
        )}
      >
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-[340px] animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 grid-rows-[auto_1fr] gap-9 rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Orders Overview
        </h2>
      </div>

      <div className="grid place-items-center">
        <DonutChart data={data} />
      </div>
    </div>
  );
}

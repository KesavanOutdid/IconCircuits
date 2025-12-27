"use client";

import { cn } from "@/lib/utils";
import { useAnalytics } from "@/app/(home)/_hooks/useAnalytics";
import { QuotationsDonutChart } from "./chart";

type PropsType = {
  className?: string;
};

export function QuotationsChart({
  className,
}: PropsType) {
  const { data: analyticsData, loading } = useAnalytics();
  
  const summary = analyticsData?.quotationsSummary;
  
  const data = summary ? [
    { name: "Pending", amount: summary.pending },
    { name: "Quoted", amount: summary.quoted },
    { name: "Accepted", amount: summary.accepted },
    { name: "Rejected", amount: summary.rejected },
    { name: "Cancelled", amount: summary.cancelled },
    { name: "Re-quote Req", amount: summary.requoteRequested },
  ] : [];

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
          Quotations Statistics
        </h2>
      </div>

      <div className="grid place-items-center">
        <QuotationsDonutChart data={data} />
      </div>
    </div>
  );
}

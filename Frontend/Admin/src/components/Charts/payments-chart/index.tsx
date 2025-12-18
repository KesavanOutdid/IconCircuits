"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/app/(home)/_hooks/useAnalytics";
import { PaymentsSplineChart } from "./spline-chart";

type PropsType = {
  className?: string;
};

type Period = "daily" | "weekly" | "monthly" | "yearly";

export function PaymentsChart({ className }: PropsType) {
  const [period, setPeriod] = useState<Period>("weekly");
  const [monthOffset, setMonthOffset] = useState(8);
  const itemsPerPage = 5;
  const { data: analyticsData, loading } = useAnalytics();

  useEffect(() => {
    setMonthOffset(0);
  }, [period]);

  const getPaymentsData = () => {
    let paymentsData = analyticsData?.paymentsByPeriod?.[period];
    if (!paymentsData) {
      return [];
    }

    let chartData: { x: string | number; y: number }[] = [];

    if (period === "daily") {
      chartData = paymentsData.map((item: any) => ({
        x: item.date || "No Data",
        y: item.total,
      }));
    } else if (period === "weekly") {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      chartData = paymentsData.map((item: any, index: number) => ({
        x: item.day || dayNames[index % 7] || item._id,
        y: item.total,
      }));
    } else if (period === "monthly") {
      chartData = paymentsData.map((item: any) => ({
        x: item.month,
        y: item.total,
      }));
    } else if (period === "yearly") {
      chartData = paymentsData.map((item: any) => ({
        x: String(item.year || item._id),
        y: item.total,
      }));
    }

    return chartData;
  };



  const data = getPaymentsData();

  const periodLabels: Record<Period, string> = {
    daily: "Daily Payments",
    weekly: "Weekly Payments",
    monthly: "Monthly Payments",
    yearly: "Yearly Payments",
  };

  const displayData = period === "monthly"
    ? data.slice(monthOffset, monthOffset + itemsPerPage)
    : data;

  const hasNextMonth = period === "monthly" && (monthOffset + itemsPerPage) < data.length;
  const hasPrevMonth = period === "monthly" && monthOffset > 0;

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white px-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          {periodLabels[period]}
        </h2>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="rounded border border-[#E8E8E8] bg-white px-4 py-2 text-sm font-medium text-dark outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          {period === "monthly" && (
            <div className="flex gap-2">
              <button
                onClick={() => setMonthOffset(Math.max(0, monthOffset - itemsPerPage))}
                disabled={!hasPrevMonth}
                className="rounded border border-[#E8E8E8] bg-white px-3 py-2 text-sm font-medium text-dark disabled:opacity-50 dark:border-form-strokedark dark:bg-form-input dark:text-white"
              >
                &lt;
              </button>
              <button
                onClick={() => setMonthOffset(monthOffset + itemsPerPage)}
                disabled={!hasNextMonth}
                className="rounded border border-[#E8E8E8] bg-white px-3 py-2 text-sm font-medium text-dark disabled:opacity-50 dark:border-form-strokedark dark:bg-form-input dark:text-white"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-dark dark:text-white">Loading...</p>
        </div>
      ) : (
        <PaymentsSplineChart data={displayData} color="#5750F1" />
      )}
    </div>
  );
}

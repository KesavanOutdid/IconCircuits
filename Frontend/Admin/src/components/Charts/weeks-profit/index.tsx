"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/app/(home)/_hooks/useAnalytics";
import { WeeksProfitChart } from "./chart";

type PropsType = {
  className?: string;
};

type Period = "daily" | "weekly" | "monthly" | "yearly";

export function WeeksProfit({ className }: PropsType) {
  const [period, setPeriod] = useState<Period>("weekly");
  const [monthOffset, setMonthOffset] = useState(0);
  const itemsPerPage = 5;
  const { data: analyticsData, loading } = useAnalytics();

  useEffect(() => {
    setMonthOffset(0);
  }, [period]);

  const getOrdersData = () => {
    let ordersData = analyticsData?.ordersByPeriod?.[period];
    if (!ordersData) {
      return [];
    }

    let chartData: { x: string | number; y: number }[] = [];

    if (period === "daily") {
      chartData = ordersData.map((item: any) => ({
        x: item.date || "No Data",
        y: item.completed,
      }));
    } else if (period === "weekly") {
      chartData = ordersData.map((item: any) => ({
        x: item.day,
        y: item.completed,
      }));
    } else if (period === "monthly") {
      chartData = ordersData.map((item: any) => ({
        x: item.month,
        y: item.completed,
      }));
    } else if (period === "yearly") {
      chartData = ordersData.map((item: any) => ({
        x: String(item.year),
        y: item.completed,
      }));
    }

    return chartData;
  };



  const data = getOrdersData();

  const periodLabels: Record<Period, string> = {
    daily: "Daily Orders",
    weekly: "Weekly Orders",
    monthly: "Monthly Orders",
    yearly: "Yearly Orders",
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
          Orders Overview
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
        </div>

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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-dark dark:text-white">Loading...</p>
        </div>
      ) : (
        <WeeksProfitChart data={displayData} color="#5750F1" period={period} />
      )}
    </div>
  );
}

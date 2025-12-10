"use client";

import { compactFormat } from "@/lib/format-number";
import { useAnalytics } from "../../_hooks/useAnalytics";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export function OverviewCardsGroup() {
  const { data, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Active Users"
        data={{
          ...data.activeUsers,
          value: compactFormat(data.activeUsers.value),
        }}
        Icon={icons.Users}
      />

      <OverviewCard
        label="Total Orders"
        data={{
          ...data.totalOrders,
          value: compactFormat(data.totalOrders.value),
        }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Total Contacts"
        data={{
          ...data.totalContacts,
          value: compactFormat(data.totalContacts.value),
        }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="Total Newsletter"
        data={{
          ...data.totalNewsletter,
          value: compactFormat(data.totalNewsletter.value),
        }}
        Icon={icons.Profit}
      />
    </div>
  );
}

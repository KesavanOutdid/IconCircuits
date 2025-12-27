"use client";

import { compactFormat } from "@/lib/format-number";
import { useAnalytics } from "../../_hooks/useAnalytics";
import { OverviewCard } from "./card";
import * as icons from "./icons";
import { OverviewCardsSkeleton } from "./skeleton";

export function OverviewCardsGroup() {
  const { data, loading } = useAnalytics();

  if (loading || !data) {
    return <OverviewCardsSkeleton />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-5 2xl:gap-7.5">
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
        Icon={icons.Contacts}
      />

      <OverviewCard
        label="Total Newsletter"
        data={{
          ...data.totalNewsletter,
          value: compactFormat(data.totalNewsletter.value),
        }}
        Icon={icons.Newsletter}
      />

      <OverviewCard
        label="Total Quotations"
        data={{
          ...data.totalQuotations,
          value: compactFormat(data.totalQuotations.value),
        }}
        Icon={icons.Quotations}
      />
    </div>
  );
}

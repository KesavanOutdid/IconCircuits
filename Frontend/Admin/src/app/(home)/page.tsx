import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { UsedDevices } from "@/components/Charts/used-devices";
import { UsersStatus } from "@/components/Charts/users-status";
import { WeeksProfit } from "@/components/Charts/weeks-profit";
import { PaymentsChart } from "@/components/Charts/payments-chart";
import { TopChannels } from "@/components/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { Suspense } from "react";
import { ChatsCard } from "./_components/chats-card";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { RegionLabels } from "./_components/region-labels";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default function Home() {
  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
       

        <WeeksProfit
          timeFrame={undefined}
          className="col-span-12 xl:col-span-6"
        />

        <PaymentsChart
          className="col-span-12 xl:col-span-6"
        />

        <UsedDevices
          className="col-span-12 xl:col-span-5"
          timeFrame={undefined}
        />

      
      
      </div>
    </>
  );
}

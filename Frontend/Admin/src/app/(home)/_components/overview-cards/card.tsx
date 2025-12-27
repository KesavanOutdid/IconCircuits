import { ArrowDownIcon, ArrowUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import type { JSX, SVGProps } from "react";

type OrderStatus = {
  label: string;
  value: number | string;
  growthRate: number;
};

type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate: number;
  } | OrderStatus[];
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

export function OverviewCard({ label, data, Icon }: PropsType) {
  const isArray = Array.isArray(data);

  if (isArray) {
    return (
      <div className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark min-h-fit">
        <dd className="text-sm font-medium text-dark-6 mb-4">{label}</dd>
        {data.map((item) => {
          const isDecreasing = item.growthRate < 0;
          return (
            <div
              key={item.label}
              className="mb-3 flex items-center justify-between gap-4 last:mb-0"
            >
              <div className="flex flex-1 items-center gap-3">
                <div className="flex-shrink-0">
                  <Icon className="size-11" />
                </div>

                <dl>
                  <dt className="text-base font-bold text-dark dark:text-white">
                    {item.value}
                  </dt>
                  <dd className="text-xs font-medium text-dark-6">
                    {item.label}
                  </dd>
                </dl>
              </div>

              {item.growthRate !== 0 && (
                <dl
                  className={cn(
                    "flex-shrink-0 text-xs font-medium",
                    isDecreasing ? "text-red" : "text-green",
                  )}
                >
                  <dt className="flex items-center gap-1">
                    {item.growthRate}%
                    {isDecreasing ? (
                      <ArrowDownIcon aria-hidden />
                    ) : (
                      <ArrowUpIcon aria-hidden />
                    )}
                  </dt>
                </dl>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const isDecreasing = data.growthRate < 0;

  return (
    <div className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex-shrink-0">
            <Icon className="size-11" />
          </div>

          <dl>
            <dd className="text-md font-medium text-dark-5">{label}</dd>
            <dt className="text-lg font-bold text-dark dark:text-white">
             + {data.value}
            </dt>
          </dl>
        </div>

        {data.growthRate !== 0 && (
          <dl
            className={cn(
              "flex-shrink-0 text-xs font-medium",
              isDecreasing ? "text-red" : "text-green",
            )}
          >
            <dt className="flex items-center gap-1">
              {data.growthRate}%
              {isDecreasing ? (
                <ArrowDownIcon aria-hidden className="size-2.5" />
              ) : (
                <ArrowUpIcon aria-hidden className="size-2.5" />
              )}
            </dt>
          </dl>
        )}
      </div>
    </div>
  );
}

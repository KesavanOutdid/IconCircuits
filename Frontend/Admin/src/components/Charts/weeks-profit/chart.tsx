"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  data: { x: string | number; y: number }[];
  color?: string;
  height?: number;
  period?: "daily" | "weekly" | "monthly" | "yearly";
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function WeeksProfitChart({ data, color = "#5750F1", height = 350, period = "weekly" }: PropsType) {
  const options: ApexOptions = {
    colors: [color],
    chart: {
      type: "area",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      dropShadow: {
        enabled: true,
        top: 3,
        left: 14,
        blur: 4,
        opacity: 0.12,
        color: color,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100],
      },
    },
    markers: {
      size: 0,
      colors: [color],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: true,
      borderColor: "#E8E8E8",
      strokeDashArray: 5,
      position: "back",
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      type: "category",
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      x: {
        show: true,
      },
    },
  };

  const series = [
    {
      name: "Orders",
      data: data.map(d => ({ x: d.x, y: d.y })),
    },
  ];

  return (
    <div className="-ml-3.5 mt-3">
      <Chart
        options={options}
        series={series}
        type="area"
        height={height}
      />
    </div>
  );
}

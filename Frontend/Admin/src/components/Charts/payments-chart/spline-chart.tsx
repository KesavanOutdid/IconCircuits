"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  data: { x: string | number; y: number }[];
  color?: string;
  height?: number;
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function PaymentsSplineChart({ data, color = "#5750F1", height = 370 }: PropsType) {
  const options: ApexOptions = {
    colors: [color],
    chart: {
      type: "line",
      stacked: false,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 4,
      colors: [color],
    },
    fill: {
      type: "solid",
      opacity: 0.8,
    },
    markers: {
      size: 7,
      colors: [color],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 9,
      },
    },
    grid: {
      strokeDashArray: 0,
      borderColor: "#E8E8E8",
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
          opacity: 0.3,
        },
      },
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "inherit",
      fontWeight: 500,
      fontSize: "14px",
      markers: {
        size: 9,
        shape: "circle",
      },
    },
  };

  const series = [
    {
      name: "Payment",
      data: data,
    },
  ];

  return (
    <div className="-ml-3.5 mt-3">
      <Chart
        options={options}
        series={series}
        type="line"
        height={height}
      />
    </div>
  );
}

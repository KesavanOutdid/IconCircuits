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

export function WeeksProfitChart({ data, color = "#5750F1", height = 370, period = "weekly" }: PropsType) {
  const columnWidth = period === "weekly" ? "25%" : "12%";
  const colorPalette = color === "#5750F1" 
    ? ["#5750F1", "#5750F1", "#5750F1", "#5750F1", "#5750F1", "#5750F1", "#5750F1"]
    : ["#5750F1", "#5750F1", "#5750F1", "#5750F1", "#5750F1", "#5750F1", "#5750F1"];

  const seriesData = data.map((item, index) => ({
    x: item.x,
    y: item.y,
    fillColor: colorPalette[index % colorPalette.length],
  }));

  const options: ApexOptions = {
    colors: [color],
    chart: {
      type: "bar",
      stacked: false,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 2,
              columnWidth,
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 2,
        columnWidth,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      strokeDashArray: 5,
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
    fill: {
      opacity: 1,
    },
  };

  const series = [
    {
      name: "Value",
      data: seriesData as any,
    },
  ];

  return (
    <div className="-ml-3.5 mt-3">
      <Chart
        options={options}
        series={series}
        type="bar"
        height={height}
      />
    </div>
  );
}

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Chart from 'react-apexcharts'
import ChartTab from '../common/ChartTab'
import { useQuery } from '@tanstack/react-query'
import useDashboard from "../../services/useDashboard";

const StatisticsChart = () => {
  const [sales, setSales] = useState([])
  const [revenue, setRevenue] = useState([])

  const {getSalesStatistics} = useDashboard();
  const [selectedTab, setSelectedTab] = useState("overview");

    const {data, isLoading, isError, refetch} = useQuery({
      queryKey: ["SalesStatistics"],
      queryFn: () => getSalesStatistics(),
      staleTime: 5 * 60 * 1000,
    });
    let series = [];
      if (!isLoading) {
        if (selectedTab === "sales") {
          series = [
            {
              name: "Sales",
              data: data?.sales,
              yAxisIndex: 0,
            },
          ];
        } else if (selectedTab === "revenue") {
          series = [
            {
              name: "Revenue",
              data: data?.revenue?.map(Number),
              yAxisIndex: 1,
            },
          ];
        } else {
          series = [
            {
              name: "Sales",
              data: data?.sales,
              yAxisIndex: 0,
            },
            {
              name: "Revenue",
              data: data?.revenue?.map(Number),
              yAxisIndex: 1,
            },
          ];
        }
      }
  const options = {
    chart: {
      type: 'area',
      height: 310,
      fontFamily: 'Outfit, sans-serif',
      toolbar: { show: false },
    },
    colors: ['#465FFF', '#9CB9FF'],
    stroke: { curve: 'straight', width: [2, 2] },
    fill: {
      type: 'gradient',
      gradient: { opacityFrom: 0.55, opacityTo: 0 },
    },
    markers: {
      size: 0,
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: 'dd MMM yyyy' },
    },
    xaxis: {
      type: 'category',
      categories:data?.months,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: [
    {
      title: { text: 'Sales' },
      labels: {
        style: {
          fontSize: '12px',
          colors: ['#465FFF'],
        },
      },
    },
    {
      opposite: true,
      title: { text: 'Revenue' },
      labels: {
        style: {
          fontSize: '12px',
          colors: ['#9CB9FF'],
        },
      },
    },
  ],
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            Target you’ve set for each month
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab selected={selectedTab} setSelected={setSelectedTab} />
        </div>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {!isLoading && (
            <Chart options={options} series={series} type="area" height={310} />
          )}
        </div>
      </div>
    </div>
  )
}

export default StatisticsChart
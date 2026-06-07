import React from "react";
import { useSelector } from "react-redux";
import Badge from "../common/Badge";
import DaynamicTable from "../common/Table";

const TrackSalesTable = () => {
  const { data } = useSelector((state) => state.sales);

  const headers = [
    "Order ID",
    "Date of Creation",
    "Customer Name",
    "Model",
    "Type",
    "Ratio",
    "Qty",
    "Status",
  ];

  const transformedData = data.map((order) => ({
    id: order.id,
    data: [
      order.id ?? "—",
      order.createdAt ?? "—",
      order.customerName ?? "—",
      order.model ?? "—",
      order.type ?? "—",
      order.ratio ?? "—",
      order.quantity ?? "—",
      order.status ?? "—",
    ],
  }));

  const getStatusColor = (statusText) => {
    if (!statusText) return "light";
    const lower = statusText.toLowerCase();
    
    // Handle new item statuses
    if (lower.includes("processed")) return "success";
    if (lower.includes("in process") || lower.includes("inprocess")) return "warning";
    if (lower.includes("pending")) return "secondary";
    
    // Legacy status handling
    if (lower.includes("dispatched") || lower.includes("approved")) return "success";
    if (lower.includes("fg") || lower.includes("cancelled")) return "info";
    return "primary";
  };

  const formatCell = (cell, colIndex) => {
    if (colIndex === 7) {
      return (
        <Badge size="sm" color={getStatusColor(cell)}>
          {cell}
        </Badge>
      );
    }
    return cell;
  };

  return (

      <div className="max-w-full max-h-[500px] overflow-x-auto overflow-y-auto">
        <DaynamicTable
          header={headers}
          data={transformedData}
          page_no={1}
          total_pages={1}
          onPageChange={() => {}}
          formatCell={formatCell}
        />
      </div>

  );
};

export default TrackSalesTable;
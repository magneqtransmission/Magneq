import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import usePurchase from "../../services/usePurchase";
import PurchaseMetrics from "../../components/purchase/PurchaseMetrix";
import Pagination from "../../components/common/Pagination";
import DaynamicTable from "../../components/common/Table";
import { useNavigate } from "react-router-dom";
import Badge from "../../components/common/Badge";
import { HiOutlineClock } from "react-icons/hi2";
import Button from "../../components/buttons/Button";

const PurchaseOrder = () => {
  const headers = [
    "Production Id",
    "Vendor Name",
    "Date of purchase",
    "Order Details",
    "Status",
  ];
  const { getAllPurchaseOrders } = usePurchase();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  //   const data = useSelector((state) => state.purchase);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["Purchases", page, search],
    queryFn: () => getAllPurchaseOrders(page, search),
    staleTime: 5 * 60 * 1000,
  });
  const handleRowClick = (obj) => {
    console.log(obj);
    navigate(`/purchase/${obj.item_id}`);
  };
  const formatCell = (cell, idx) => {
    if (
      idx === 1 &&
      typeof cell === "string" &&
      /^\d{4}-\d{2}-\d{2}T/.test(cell)
    ) {
      return new Date(cell).toLocaleDateString();
    }

    if (idx === 3 && Array.isArray(cell)) {
      return (
        <div className="flex flex-wrap gap-2">
          {cell.map((entry, i) => (
            <div
              key={i}
              className="bg-background text-text text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
            >
              {entry.split("/").join(" | ")}
            </div>
          ))}
        </div>
      );
    }

    if (idx === 4) {
      // Status color logic
      const status = cell;
      let color = "primary";
      let label = status;
      if (status === "NOT_IN_STOCK") {
        color = "danger";
        label = "Not In Stock";
      } else if (status === "PENDING") {
        color = "warning";
        label = "Pending";
      } else if (status === "PROCESSED") {
        color = "success";
        label = "Processed";
      } else if (status === "COMPLETE") {
        color = "success";
        label = "Complete";
      }
      return (
        <Badge size="sm" color={color}>
          {label}
        </Badge>
      );
    }

    return cell ?? "—";
  };
  if (isLoading)
    return <p className="text-center">Loading production data...</p>;
  if (isError)
    return (
      <p className="text-center text-red-500">Error loading production data.</p>
    );
  return (
    <div>
      <div className="col-span-12 space-y-4 pb-4">
        <PurchaseMetrics />
      </div>
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-3xl ml-2 text-text">Purchase Orders</h1>
        <Button
          variant="outline"
          startIcon={<HiOutlineClock />}
          onClick={() => navigate("/history/raw_material")}
        >
          History
        </Button>
      </div>
      <DaynamicTable
        header={headers}
        tableData={{
          item: data?.item || [],
          page_no: data?.page_no,
          total_pages: data?.total_pages,
          total_items: data?.total_items,
        }}
        onRowClick={handleRowClick}
        formatCell={formatCell}
      />
      <Pagination
        currentPage={page}
        totalPages={data.total_pages}
        onPageChange={(page) => setPage(page)}
      />
    </div>
  );
};
export default PurchaseOrder;

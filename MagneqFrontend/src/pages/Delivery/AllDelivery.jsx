import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DaynamicTable from "../../components/common/Table";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../context/SearchbarContext";
import Badge from "../../components/common/Badge";
import useInvoice from "../../services/useInvoice";
import useDelivery from "../../services/useDelivery";

const AllDelivery = ({ isDashboard }) => {
  const navigate = useNavigate();
  const { getAllDeliveries } = useDelivery();
  const [page, setPage] = useState(1);
  const { searchQuery, setSearchQuery } = useSearch();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["AllDeliveries", page, searchQuery],
    queryFn: () => getAllDeliveries(page, searchQuery),
    staleTime: 5 * 60 * 1000,
  });
  console.log("sdncsd", data)

  useEffect(() => {
    if (!isDashboard) return;
    setPage(0);
    setSearchQuery("");
  }, [isDashboard]);

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
      if (status === "Unapproved") {
        color = "danger";
        label = "Unapproved";
      } else if (status === "INPROCESS") {
        color = "warning";
        label = "In Process";
      } else if (status === "PROCESSED") {
        color = "success";
        label = "Processed";
      } else if (status === "DELIVERED") {
        color = "success";
        label = "Delivered";
      } else if (status === "DISPATCHED") {
        color = "info";
        label = "Dispatched";
      } else if (status === "CANCELLED") {
        color = "secondary";
        label = "Cancelled";
      }
      return (
        <Badge size="sm" color={color}>
          {label}
        </Badge>
      );
    }

    return cell ?? "—";
  };

  const handlePageChange = (newPage) => {
    setPage(parseInt(newPage));
  };

  const handleRowClick = (row) => {
    navigate(`/delivery/${row.item_id}`);
  };

  if (isLoading) return <p className="text-center py-4">Loading sales...</p>;
  if (isError)
    return <p className="text-center py-4 text-red-500">Error loading sales</p>;

  return (
    <div className="pt-5">
      <DaynamicTable
        header={data.header}
        tableData={{ item: data.item }}
        formatCell={formatCell}
        onRowClick={handleRowClick}
      />
      {/* Remove the hardcoded h2 click */}
      {isDashboard && (
        <Pagination
          currentPage={page}
          totalPages={data.total_pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AllDelivery;

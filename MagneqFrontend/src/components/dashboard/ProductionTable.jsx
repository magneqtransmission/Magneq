import React, {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import DaynamicTable from "../common/Table";
import useProduction from "../../services/useProduction";
import Pagination from "../common/Pagination";
import {useNavigate} from "react-router-dom";
import { useSearch } from "../../context/SearchbarContext";

const ProductionTable = () => {
  const {getPendingProductions} = useProduction();
  const [page, setPage] = useState(1);
  const { searchQuery } = useSearch();
  const navigate = useNavigate();
  const {data, isLoading, isError} = useQuery({
    queryKey: ["pendingProductions", page, searchQuery],
    queryFn: () => getPendingProductions(page, searchQuery),
    staleTime: 0, // Data is immediately stale, ensuring fresh fetch
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const formatCell = (cell, idx) => {
    // Total Sales Quantity (idx === 1)
    if (idx === 1 && typeof cell === "number") {
      return (
        <div className="text-center font-semibold text-blue-600">
          {cell}
        </div>
      );
    }

    // Production Pending Quantity (idx === 2)
    if (idx === 2 && typeof cell === "number") {
      return (
        <div className="text-center font-semibold text-orange-600">
          {cell}
        </div>
      );
    }

    // Current FG Stock Quantity (idx === 3)
    if (idx === 3 && typeof cell === "number") {
      return (
        <div className="text-center font-semibold text-green-600">
          {cell}
        </div>
      );
    }

    return cell ?? "—";
  };

  const handleRowClick = (obj) => {
    navigate(`/production/${obj.item_id}`);
  };

  if (isLoading)
    return <p className="text-center">Loading production data...</p>;
  if (isError)
    return (
      <p className="text-center text-red-500">Error loading production data.</p>
    );

  return (
    <div>
      <DaynamicTable
        header={data?.header || []}
        tableData={{
          item: data?.item || [],
          page_no: data?.page_no,
          total_pages: data?.total_pages,
          total_items: data?.total_items,
        }}
        formatCell={formatCell}
        onRowClick={handleRowClick}
      />

      <Pagination
        currentPage={page}
        totalPages={data.total_pages}
        onPageChange={(page) => setPage(page)}
      />
    </div>
  );
};

export default ProductionTable;

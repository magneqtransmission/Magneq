import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useHistory from "../../services/useHistory";
import DaynamicTable from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import { HiOutlineClock } from "react-icons/hi2";

import BasicSearchBar from "../../components/common/BasicSearchBar";
import Button from "../../components/buttons/Button";

const RawMaterialHistory = () => {
  const [page, setPage] = useState(1);
  const [classType, setClassType] = useState("");
  const [search, setSearch] = useState("");
  const { getRawMaterialHistory } = useHistory();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["rmHistory", page, classType, search],
    queryFn: () => getRawMaterialHistory(page, 10, classType, search),
  });

  if (isError) return <div className="p-4 text-red-500">Error loading Raw Material History</div>;

  const formatCell = (cell, idx) => {
    // Hist-ID (col 0) and Ref ID (col 7)
    if (idx === 0 || idx === 7) {
      return (
        <span className="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
          {cell}
        </span>
      );
    }
    // Date (col 1)
    if (idx === 1) {
      return <span className="text-[11px] whitespace-nowrap">{cell}</span>;
    }
    // Snapshot (col 5)
    if (idx === 5) {
      return <div className="max-w-[150px] truncate text-xs" title={cell}>{cell}</div>;
    }
    // Default formatting for other columns
    return cell;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-background text-text space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HiOutlineClock className="text-3xl text-primary" />
          <h1 className="text-3xl font-bold">Raw Material Stock History</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <BasicSearchBar
            placeholder="Search by ID, Name or Reference..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:w-64"
          />
          <div className="flex gap-2">
            {["", "A", "B", "C"].map((c) => (
              <Button
                key={c}
                onClick={() => { setClassType(c); setPage(1); }}
                variant={classType === c ? "primary" : "outline"}
                className="px-6 py-2"
              >
                {c === "" ? "All" : `Class ${c}`}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 overflow-hidden rounded-xl shadow-md">
        <DaynamicTable
          header={data?.header || []}
          tableData={data || { item: [] }}
          isLoading={isLoading}
          formatCell={formatCell}
        />
      </div>

      {!isLoading && data && (
        <Pagination
          currentPage={page}
          totalPages={data.total_pages}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
};

export default RawMaterialHistory;

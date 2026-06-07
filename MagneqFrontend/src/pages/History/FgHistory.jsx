import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useHistory from "../../services/useHistory";
import DaynamicTable from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import { HiOutlineClock } from "react-icons/hi2";

import BasicSearchBar from "../../components/common/BasicSearchBar";

const FgHistory = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { getFgHistory } = useHistory();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["fgHistory", page, search],
    queryFn: () => getFgHistory(page, 10, search),
  });

  if (isError) return <div className="p-4 text-red-500">Error loading FG History</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-background text-text space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HiOutlineClock className="text-3xl text-primary" />
          <h1 className="text-3xl font-bold">Finished Goods History</h1>
        </div>

        <BasicSearchBar
          placeholder="Search by ID, Model or Type..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full md:w-80"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl shadow-md">
        <DaynamicTable
          header={data?.header || []}
          tableData={data || { item: [] }}
          isLoading={isLoading}
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

export default FgHistory;

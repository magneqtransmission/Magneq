import React, { useState } from "react";
import usePurchase from "../../services/usePurchase";
import { useQuery } from "@tanstack/react-query";
import DaynamicTable from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import { useNavigate } from "react-router-dom";
import Button from "../../components/buttons/Button";

const TrackVendor = () => {
  const { getAllVendors } = usePurchase();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  const {
    data: usersQuery,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["SUPPLIER", search, currentPage],
    queryFn: () =>
      getAllVendors({ search, page: currentPage, limit }),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });
console.log(usersQuery)
  const transformedData = usersQuery?.item?.map((user, idx) => ({
    id: user.id,
    data: [
      user.data[0] || "—",
      user.data[1] || "—",
    ],
  }));
    const handleRowClick = (row) => {
    navigate(`/purchase/${row.item_id}/list`);
  };
  const totalPages = usersQuery?.total_pages || 1;

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold mt-4">Suppliers</h2>
      {isLoading && <p>Loading suppliers...</p>}
      {isError && <p className="text-red-500">Failed to load suppliers.</p>}
      {usersQuery && (
        <>
          <DaynamicTable
            header={usersQuery.header}
            tableData={{ item: transformedData }}
            onRowClick={handleRowClick}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}
    </div>
  );
};

export default TrackVendor;

import React, { useState } from "react";
import usePurchase from "../../services/usePurchase";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DaynamicTable from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";
import { useNavigate } from "react-router-dom";
import Button from "../../components/buttons/Button";

const VendorPurchases = () => {
  const headers = [
    "Production Id",
    "Vendor Name",
    "Date of purchase",
    "Order Details",
    "Status",
  ];
  const { id } = useParams();
  const { getAllVendorPurchases } = usePurchase();
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["Purchases", id, currentPage],
    queryFn: () =>
      getAllVendorPurchases({ id, page: currentPage }),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });
    
    console.log({ id, page: currentPage });
    const handleRowClick = (row) => {
    navigate(`/purchase/${row.item_id}`);
  };
  const totalPages = data?.total_pages || 1;

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold mt-4">Vendor Purchase List</h2>
      {isLoading && <p>Loading suppliers...</p>}
      {isError && <p className="text-red-500">Failed to load suppliers.</p>}
      {data && (
        <>
          <DaynamicTable
            header={headers}
            tableData={{
                item: data?.item || [],
                page_no: data?.page_no,
                total_pages: data?.total_pages,
                total_items: data?.total_items,
            }}
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

export default VendorPurchases;

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import usePurchase from "../../services/usePurchase";
import DaynamicTable from "../../components/common/Table";
import Pagination from "../../components/common/Pagination";

const tabBar = ["A", "B", "C"];

const ShortQuantity = () => {
  const [className, setClassName] = useState("A");
  const [currentPage, setCurrentPage] = useState(1);
  const { getShortQuantity } = usePurchase();

  // Fetch short quantity data with pagination
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["short-quantity", className, currentPage],
    queryFn: () => getShortQuantity(className, currentPage),
    keepPreviousData: true,
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleTabChange = (item) => {
    setClassName(item);
    setCurrentPage(1);
    refetch(); // refresh when switching tab
  };

  return (
    <div className="w-full">
      {/* Tab Bar with Glass Effect */}
      <div
        className="flex gap-2 p-2 rounded-3xl 
        bg-background/40 backdrop-blur-md border border-white/10 shadow-lg"
      >
        {tabBar.map((item) => (
          <button
            key={item}
            onClick={() => handleTabChange(item)}
            className={`flex-1 py-2 rounded-2xl font-medium transition-all duration-300
              ${
                className === item
                  ? "bg-button text-white shadow-md scale-105"
                  : "bg-muted/70 text-muted-foreground shadow-sm hover:shadow-md"
              }
            `}
          >
            Class {item}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-text mb-4">
          Short Quantity: Class {className}
        </h2>

        {isLoading && <p className="text-muted-foreground">Loading...</p>}
        {isError && (
          <p className="text-red-500">Error fetching short quantity data.</p>
        )}

        {!isLoading && data && data.item?.length > 0 && (
          <>
            <DaynamicTable header={data.header} tableData={data} />

            {/* Pagination */}
            <Pagination
              currentPage={data.page_no || 1}
              totalPages={data.total_pages || 1}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {!isLoading && data && data.item?.length === 0 && (
          <p className="text-gray-500 mt-4 text-center">
            No short quantity items found for Class {className}.
          </p>
        )}
      </div>
    </div>
  );
};

export default ShortQuantity;

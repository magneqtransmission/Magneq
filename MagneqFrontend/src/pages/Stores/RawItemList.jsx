import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import StoreHeader from "./StoreHeader";
import DaynamicTable from "../../components/common/Table";
import useRawMaterials from "../../services/useRawMaterials";
import Pagination from "../../components/common/Pagination";
import { useSearch } from "../../context/SearchbarContext";

const RawItemList = ({ classType = "A" }) => {
  const navigate = useNavigate();
  const { getRawMaterialsByClass } = useRawMaterials();
  const { searchQuery } = useSearch();

  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = {
    search: searchQuery,
    type: "",
    name: "",
    page: currentPage, 
  };

  const {
    data: rawMaterialData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["rawMaterials", classType, currentPage, searchQuery], 
    queryFn: () => getRawMaterialsByClass(classType, queryParams),
    keepPreviousData: true, 
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [classType, searchQuery]);

  const tableData = rawMaterialData ?? {
    header: [],
    item: [],
    page_no: 1,
    total_pages: 1,
    total_items: 0,
  };

  const handleRowClick = (row) => {
    navigate(`/raw_material/${classType}/${row.item_id}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="mt-8 px-2 sm:px-4 md:px-6 lg:px-8">
      {isLoading ? (
        <p className="text-center py-6">Loading...</p>
      ) : isError ? (
        <p className="text-center text-red-500 py-6">
          Error: {error.message || "Something went wrong"}
        </p>
      ) : (
        <>
          <DaynamicTable
            header={tableData.header}
            tableData={tableData}
            onRowClick={handleRowClick}
            formatCell={(cell, idx) => {
              if (Array.isArray(cell)) {
                return (
                  <div className="flex flex-wrap gap-2">
                    {cell.map((entry, i) => (
                      <div
                        key={i}
                        className="bg-background text-text text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
                      >
                        {entry}
                      </div>
                    ))}
                  </div>
                );
              }
              if (idx === 3 && !cell) {
                return (
                  <span className="text-xs text-gray-400 italic">Unknown</span>
                );
              }
              
              // Color code the status column (index 4 - Stock Status)
              if (idx === 4 && cell) {
                const getStatusColor = (status) => {
                  switch (status) {
                    case "In Stock":
                      return "bg-green-100 text-green-800 border-green-200";
                    case "Low Quantity":
                      return "bg-yellow-100 text-yellow-800 border-yellow-200";
                    case "Out of Stock":
                      return "bg-red-100 text-red-800 border-red-200";
                    default:
                      return "bg-gray-100 text-gray-800 border-gray-200";
                  }
                };
                
                return (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(cell)}`}
                  >
                    {cell}
                  </span>
                );
              }
              
              return cell ?? "—";
            }}
          />

          {tableData.total_pages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={tableData.total_pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RawItemList;

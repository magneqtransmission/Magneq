import React, { useState } from "react";
import useManage from "../../../services/useManage";
import { useQuery } from "@tanstack/react-query";
import DaynamicTable from "../../../components/common/Table";
import Pagination from "../../../components/common/Pagination";  
import { useNavigate } from "react-router-dom";
import BasicSearchBar from "../../../components/common/BasicSearchBar";
import Button from "../../../components/buttons/Button";

const ManageCustomers = () => {
  const { getAllCustomers } = useManage();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; 
  const navigate = useNavigate();

  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["CUSTOMER", search, currentPage],
    queryFn: () =>
      getAllCustomers({ page: currentPage, limit,search }),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  const transformedData = userData?.item?.map((user, idx) => (
    {
    id: user.id || idx,
    data: [
      user.data[0] || "—",
      user.data[1] || "—",
      user.data[2] || "—",
    ],
  }));

  // Handle row click to navigate to edit page
  const handleRowClick = ({ item_id }) => {
    navigate(`/manage_customers/${item_id}/edit`);
  };

  const totalPages = userData?.total_pages || 1;

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between">
        <BasicSearchBar
          placeholder="Search users by name, role or username"
          className="max-w-md"
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); 
          }}
          value={search}
        />
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate("/manage_customers/opening-balance")}
            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
          >
            Add Opening Balance
          </Button>
          <Button onClick={() => navigate("/manage_customers/create")}>
            Create Customer
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-4">Customers</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Click on any row to edit customer details
        </p>
      </div>

      {isLoading && <p>Loading customers...</p>}
      {isError && <p className="text-red-500">Failed to load customers.</p>}

      {userData && (
        <>
          <DaynamicTable
            header={userData.header}
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

export default ManageCustomers;

import React, { useState } from "react";
import useManage from "../../../services/useManage";
import { useQuery } from "@tanstack/react-query";
import DaynamicTable from "../../../components/common/Table";
import Pagination from "../../../components/common/Pagination";
import { useNavigate } from "react-router-dom";
import BasicSearchBar from "../../../components/common/BasicSearchBar";
import Button from "../../../components/buttons/Button";
import EditSupplier from "./EditSupplier"; 

const ManageSuppliers = () => {
  const { getUsersByRole } = useManage();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const limit = 10;
  const navigate = useNavigate();

  const {
    data: usersQuery,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["SUPPLIER", search, currentPage],
    queryFn: () =>
      getUsersByRole({ role: "SUPPLIER", search, page: currentPage, limit }),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  const transformedData = usersQuery?.item?.map((user, idx) => ({
    id: user.id || idx, // Use actual supplier ID if available
    data: [
      user.name || "—",
      user.phone || "—",
      user.address || "—",
      user.created_at || "—",
    ],
  }));

  const handleRowClick = (rowData) => {
    setSelectedSupplierId(rowData.item_id);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedSupplierId(null);
  };

  const totalPages = usersQuery?.total_pages || 1;

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between">
        <BasicSearchBar
          placeholder="Search users by name or phone"
          className="max-w-md"
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          value={search}
        />
        <Button onClick={() => navigate("/manage_suppliers/create")}>
          Create Supplier
        </Button>
      </div>

      <h2 className="text-xl font-semibold mt-4">Suppliers</h2>
      <p className="text-gray-600 text-sm">Click on any row to edit supplier details</p>

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

      <EditSupplier
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        supplierId={selectedSupplierId}
      />
    </div>
  );
};

export default ManageSuppliers;

import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom"; // add useNavigate
import {useQuery} from "@tanstack/react-query";
import Button from "../../../components/buttons/Button";
import DaynamicTable from "../../../components/common/Table";
import useRawMaterials from "../../../services/useRawMaterials";
import Select from "../../../components/forms/Select";
import Input from "../../../components/forms/Input";
import Pagination from "../../../components/common/Pagination";

const ManageRawMaterials = () => {
  const {class_type} = useParams();
  const navigate = useNavigate();
  const {getRawMaterialsByClass, getRawMaterialFilterConfig} =
    useRawMaterials();
  const [filters, setFilters] = useState({search: "", type: "", name: ""});

  const [page, setPage] = useState(1);
  useEffect(() => {
    setFilters({search: "", type: "", name: ""});
  }, [class_type]);

  const {data: filterConfig} = useQuery({
    queryKey: ["filter_config"],
    queryFn: getRawMaterialFilterConfig,
  });

  const {data, isLoading} = useQuery({
    queryKey: ["raw_materials", class_type, filters,page],
    queryFn: () =>
      getRawMaterialsByClass(class_type, {
        search: filters.search,
        type: filters.type,
        name: filters.name,
        page: page,
      }),
    enabled: ["A", "B", "C"].includes(class_type),
  });

  // Instead of modal open, navigate to create page for the class
  const handleAddClick = () => {
    navigate(`/raw_material/${class_type}/create`);
  };

  // Handle row click to view raw material details
  const handleRowClick = ({ item_id }) => {
    navigate(`/manage_raw_material/${class_type}/${item_id}`);
  };

  const handlePageChange = (newPage) => {
    setPage(parseInt(newPage));
  };

  const config = filterConfig?.[class_type] || {};

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">
            Manage Class {class_type} Materials
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Click on any row to view raw material details
          </p>
        </div>
        <Button onClick={handleAddClick}>+ Add Raw Material</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name/type"
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />

        {config.types && (
          <Select
            name="type"
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="">All Types</option>
            {config.types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        )}

        {config.names && (
          <Select
            name="name"
            value={filters.name}
            onChange={(e) => setFilters({...filters, name: e.target.value})}
          >
            <option value="">All Names</option>
            {config.names.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        )}
      </div>
      <DaynamicTable
        header={data?.header || []}
        tableData={data || {item: []}}
        onRowClick={handleRowClick}
        formatCell={(cell, idx) => {
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
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Pagination
          currentPage={page}
          totalPages={data.total_pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default ManageRawMaterials;

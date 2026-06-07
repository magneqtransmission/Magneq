import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "../../../components/buttons/Button";
import useRawMaterials from "../../../services/useRawMaterials";
import Badge from "../../../components/common/Badge";
import { HiOutlinePencil, HiOutlineArrowLeft, HiOutlineArchiveBox } from "react-icons/hi2";

/**
 * RawMaterialDetail Component
 * 
 * This component displays detailed information about a raw material
 * and provides an edit button to modify the details.
 * 
 * Features:
 * - Shows all raw material details in a clean layout
 * - Displays specifications in an organized format
 * - Provides edit functionality via navigation
 * - Shows loading and error states
 */
const RawMaterialDetail = () => {
  const { id, class_type } = useParams();
  const navigate = useNavigate();
  const { getRawMaterialByClassAndId } = useRawMaterials();

  const { data: rawMaterialData, isLoading, isError } = useQuery({
    queryKey: ["raw_material", class_type, id],
    queryFn: () => getRawMaterialByClassAndId(class_type, id),
    enabled: !!id && !!class_type,
  });

  const handleEdit = () => {
    navigate(`/manage_raw_material/${class_type}/${id}/edit`);
  };

  const handleBack = () => {
    navigate(`/raw_material/${class_type}`);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading raw material details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !rawMaterialData?.data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="text-lg text-red-500 mb-4">Raw material not found</div>
            <Button onClick={handleBack}>
              <HiOutlineArrowLeft className="mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const data = rawMaterialData;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <HiOutlineArchiveBox className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {data.name || "Unnamed Raw Material"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Class {data.class_type} • {data.type || "No type specified"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              <HiOutlineArrowLeft className="mr-2" />
              Back
            </Button>
            <Button onClick={handleEdit}>
              <HiOutlinePencil className="mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Basic Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Name
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {data.name || "—"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Type
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {data.type || "—"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Class Type
                </label>
                <Badge color="primary">
                  Class {data.class_type}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Minimum Quantity
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {data.min_quantity || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Quantity Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Quantity Details
            </h3>
            <div className="space-y-3">
              {data.quantity && typeof data.quantity === 'object' ? (
                Object.entries(data.quantity).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace('_', ' ')}
                    </label>
                    <p className="text-gray-900 dark:text-gray-100 font-semibold">
                      {value}
                    </p>
                  </div>
                ))
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Quantity
                  </label>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">
                    {data.quantity || 0}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Stock Status
          </h3>
          <div className="flex items-center gap-4">
            {(() => {
              let currentQuantity = 0;
              if (typeof data.quantity === 'object' && data.quantity !== null) {
                currentQuantity = Object.values(data.quantity).reduce((sum, val) => {
                  const numVal = parseFloat(val) || 0;
                  return sum + numVal;
                }, 0);
              } else {
                currentQuantity = parseFloat(data.quantity) || 0;
              }
              
              const minQuantity = data.min_quantity || 0;
              const isInStock = currentQuantity > minQuantity;
              
              return (
                <>
                  <Badge color={isInStock ? "success" : "error"}>
                    {isInStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Current: {currentQuantity} | Minimum: {minQuantity}
                  </span>
                </>
              );
            })()}
          </div>
        </div>

        {/* Additional Specifications */}
        {data.other_specification && Object.keys(data.other_specification).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Additional Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.other_specification).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace('_', ' ')}
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Record Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.created_at && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Created At
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(data.created_at).toLocaleDateString()} at{" "}
                  {new Date(data.created_at).toLocaleTimeString()}
                </p>
              </div>
            )}
            {data.updated_at && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Last Updated
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(data.updated_at).toLocaleDateString()} at{" "}
                  {new Date(data.updated_at).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawMaterialDetail;

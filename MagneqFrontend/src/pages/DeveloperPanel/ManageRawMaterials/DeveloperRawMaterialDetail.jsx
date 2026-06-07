import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Button from "../../../components/buttons/Button";
import useRawMaterials from "../../../services/useRawMaterials";
import useTransaction from "../../../services/useTransaction";
import Badge from "../../../components/common/Badge";
import Input from "../../../components/forms/Input";
import UnitsUpdateConfirmDialog from "../../../components/common/UnitsUpdateConfirmDialog";
import { HiOutlinePencil, HiOutlineArrowLeft, HiOutlineArchiveBox } from "react-icons/hi2";
import { toast } from "react-hot-toast";

/**
 * DeveloperRawMaterialDetail Component
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
const DeveloperRawMaterialDetail = () => {
  const { id, class_type } = useParams();
  const navigate = useNavigate();
  const { getRawMaterialById } = useRawMaterials();
  const { updateRawMaterialStock } = useTransaction();
  const queryClient = useQueryClient();
  
  const [showOpeningBalanceForm, setShowOpeningBalanceForm] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [quantityInput, setQuantityInput] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);

  const { data: rawMaterialData, isLoading, isError } = useQuery({
    queryKey: ["raw_material", id],
    queryFn: () => getRawMaterialById(id),
    enabled: !!id,
  });

  const handleEdit = () => {
    navigate(`/manage_raw_material/${class_type}/${id}/edit`);
  };

  const handleBack = () => {
    navigate(`/raw_material/${class_type}`);
  };

  // Get available fields based on class type
  const availableFields = useMemo(() => {
    if (!rawMaterialData) return [];
    const classType = rawMaterialData.class_type;
    if (classType === "B") {
      return [
        { value: "unprocessed", label: "Unprocessed" },
        { value: "hobbing", label: "Hobbing" },
        { value: "ht", label: "HT" },
        { value: "processed", label: "Processed" },
      ];
    }
    return [];
  }, [rawMaterialData]);

  // Check if class type is A or C (only processed field)
  const isClassAOrC = rawMaterialData?.class_type === "A" || rawMaterialData?.class_type === "C";
  const isClassB = rawMaterialData?.class_type === "B";

  // Get previous quantity for selected field
  const getPreviousQuantity = () => {
    if (!rawMaterialData) return 0;
    
    // For Class A and C, always use "processed"
    const fieldToCheck = isClassAOrC ? "processed" : selectedField;
    
    if (!fieldToCheck) return 0;
    
    if (rawMaterialData.quantity && typeof rawMaterialData.quantity === 'object') {
      return parseFloat(rawMaterialData.quantity[fieldToCheck] || 0);
    }
    return 0;
  };

  const updateStockMutation = useMutation({
    mutationFn: ({ field_name, value, label }) => 
      updateRawMaterialStock(id, { field_name, value, label }),
    onSuccess: () => {
      queryClient.invalidateQueries(["raw_material", id]);
      toast.success("Stock updated successfully");
      setQuantityInput("");
      setQuantityError("");
      setSelectedField("");
      setShowOpeningBalanceForm(false);
      setShowConfirmDialog(false);
      setPendingUpdate(null);
    },
    onError: (error) => {
      console.error("Update stock error:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Error updating stock";
      toast.error(errorMessage);
    },
  });

  const handleQuantityInputChange = (e) => {
    const value = e.target.value;
    setQuantityInput(value);
    
    // Validate integer
    if (value === "") {
      setQuantityError("");
      return;
    }
    
    const numValue = Number(value);
    if (!Number.isInteger(numValue) || numValue < 0) {
      setQuantityError("Please enter a valid positive integer");
    } else {
      setQuantityError("");
    }
  };

  const handleOpeningBalanceSubmit = () => {
    // For Class B, require field selection
    if (isClassB && !selectedField) {
      toast.error("Please select a field to update");
      return;
    }

    if (!quantityInput || quantityInput === "") {
      setQuantityError("Please enter a quantity");
      return;
    }

    const numValue = Number(quantityInput);
    if (!Number.isInteger(numValue) || numValue < 0) {
      setQuantityError("Please enter a valid positive integer");
      return;
    }

    // For Class A and C, always use "processed"
    const fieldName = isClassAOrC ? "processed" : selectedField;

    const prevQty = getPreviousQuantity();
    const enteredQty = numValue;

    // Always show confirmation dialog
    setPendingUpdate({ field_name: fieldName, prevQty, enteredQty });
    setShowConfirmDialog(true);
  };

  const handleConfirmDialog = (action) => {
    if (!pendingUpdate) return;

    const { field_name, prevQty, enteredQty } = pendingUpdate;
    const shouldAdd = action === "add";
    const finalQty = shouldAdd ? prevQty + enteredQty : enteredQty;
    
    // Get field label for display
    let fieldLabel = field_name;
    if (isClassB) {
      fieldLabel = availableFields.find(f => f.value === field_name)?.label || field_name;
    } else if (isClassAOrC) {
      fieldLabel = "Processed";
    }
    
    const label = shouldAdd
      ? `Added ${enteredQty} ${fieldLabel} units to ${rawMaterialData?.name || 'RM'} (Previous: ${prevQty}, New: ${finalQty})`
      : `Updated ${fieldLabel} units for ${rawMaterialData?.name || 'RM'} (Previous: ${prevQty}, New: ${finalQty})`;

    updateStockMutation.mutate({
      field_name,
      value: finalQty,
      label: label,
    });

    setPendingUpdate(null);
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

  if (isError || !rawMaterialData) {
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
            <Button 
              variant="primary"
              onClick={() => setShowOpeningBalanceForm(!showOpeningBalanceForm)}
              className="bg-green-600 hover:bg-green-700"
            >
              Add Opening Balance
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

        {/* Opening Balance Form */}
        {showOpeningBalanceForm && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2">
              Add Opening Balance
            </h3>
            <div className="space-y-4">
              {/* Field Selection - Only for Class B */}
              {isClassB && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Field
                  </label>
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a field</option>
                    {availableFields.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Previous Quantity - Show for Class B (when field selected) or always for Class A/C */}
              {(isClassAOrC || (isClassB && selectedField)) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Previous Quantity {isClassB ? `(${availableFields.find(f => f.value === selectedField)?.label})` : "(Processed)"}
                    </label>
                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100">
                      {getPreviousQuantity()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Enter Quantity
                    </label>
                    <Input
                      type="number"
                      value={quantityInput}
                      onChange={handleQuantityInputChange}
                      placeholder="Enter quantity (integer only)"
                      className="w-full"
                      min="0"
                      step="1"
                    />
                    {quantityError && (
                      <p className="mt-1 text-xs text-red-500">{quantityError}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Enter the quantity you want to set as final, or a quantity to add to the previous value.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleOpeningBalanceSubmit}
                    loading={updateStockMutation.isPending}
                    disabled={!quantityInput || quantityError !== "" || (isClassB && !selectedField)}
                    className="w-full"
                  >
                    Update Stock
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

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

        {/* Confirmation Dialog */}
        <UnitsUpdateConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false);
            setPendingUpdate(null);
          }}
          onConfirm={handleConfirmDialog}
          previousQty={pendingUpdate?.prevQty || 0}
          enteredQty={pendingUpdate?.enteredQty || 0}
          modelNumber={rawMaterialData?.name || "Raw Material"}
        />

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

export default DeveloperRawMaterialDetail;

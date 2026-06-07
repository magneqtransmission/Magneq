import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useRawMaterials from "../../services/useRawMaterials";
import Button from "../../components/buttons/Button";
import Badge from "../../components/common/Badge";
import RejectedQuantity from "./RejectedQuantity";
const RawMaterialDetail = () => {
  const { class_type, id } = useParams();
  const navigate = useNavigate();
  const { getRawMaterialByClassAndId, transitionQuantity } = useRawMaterials();
  const queryClient = useQueryClient();
  const [transitionLoading, setTransitionLoading] = React.useState(false);

  const [fromStage, setFromStage] = React.useState("");
  const [toStage, setToStage] = React.useState("");
  const [transitionQty, setTransitionQty] = React.useState(1);

  const {
    data: rawMaterialData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["rawMaterialDetail", class_type, id],
    queryFn: () => getRawMaterialByClassAndId(class_type, id),
    enabled: !!class_type && !!id,
  });
  console.log(rawMaterialData)

  const material = rawMaterialData;

  React.useEffect(() => {
    if (!material?.quantity) return;
    const quantityKeys = Object.keys(material.quantity);
    
    if (quantityKeys.length <= 1) return;
    
    const keys = quantityKeys.filter(key => material.quantity[key] > 0);
    setFromStage(keys[0] || "");
    const toKeys = quantityKeys.filter(key => key !== keys[0]);
    setToStage(toKeys[0] || "");
    setTransitionQty(1);
  }, [material]);

  const handleBack = () => {
    navigate(`/store`);
  };

  if (isLoading) {
    return <p className="text-lg">Loading raw material details...</p>;
  }

  if (isError) {
    return (
      <div>
        <p className="text-red-500 text-lg mb-4">
          Error: {error?.message || "Failed to load raw material details"}
        </p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }

  if (!material) {
    return (
      <div>
        <p className="text-gray-500 text-lg mb-4">Raw material not found</p>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }

  const renderQuantityInfo = () => {
    if (!material.quantity) return "No quantity information";

    if (typeof material.quantity === "object") {
      return (
        <div className="space-y-2">
          {Object.entries(material.quantity).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-medium capitalize">{key}:</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      );
    }

    return material.quantity.toString();
  };

  const renderSpecifications = () => {
    if (!material.other_specification) return "No specifications";

    return (
      <div className="space-y-2">
        {Object.entries(material.other_specification).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-medium capitalize">{key}:</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    );
  };

  const getStockStatus = () => {
    if (!material.quantity) return { status: "Unknown", color: "secondary" };

    let currentQuantity = 0;
    let minQuantity = material.min_quantity || 0;

    if (typeof material.quantity === "object" && material.quantity !== null) {
      currentQuantity = Object.values(material.quantity).reduce((sum, val) => {
        const numVal = parseFloat(val) || 0;
        return sum + numVal;
      }, 0);
    } else {
      currentQuantity = parseFloat(material.quantity) || 0;
    }

    // Three-tier stock status logic
    if (currentQuantity === 0) {
      return { status: "Out of Stock", color: "danger" };
    } else if (currentQuantity > 0 && currentQuantity < minQuantity) {
      return { status: "Low Quantity", color: "warning" };
    } else {
      return { status: "In Stock", color: "success" };
    }
  };

  const stockStatus = getStockStatus();

  const handleFromStageChange = (e) => {
    const val = e.target.value;
    setFromStage(val);
    const toKeys = Object.keys(material.quantity).filter(key => key !== val);
    setToStage(toKeys[0] || "");
    setTransitionQty(1);
  };

  const handleToStageChange = (e) => {
    setToStage(e.target.value);
    setTransitionQty(1);
  };

  // Update handleTransitionSubmit to use only the 'data' field from the backend response
  const handleTransitionSubmit = async (e) => {
    e.preventDefault();
    setTransitionLoading(true);
    try {
      await transitionQuantity(class_type, id, fromStage, toStage, transitionQty);
      // No need to check for 'success', just refetch
      await queryClient.invalidateQueries(["rawMaterialDetail", class_type, id]);
    } catch { /* ignore error */ }
    setTransitionLoading(false);
  };

  return (
    <div className="bg-background text-text">
      {/* Header */}
      <div className="flex justify-between items-center pt-5 mb-6">
        <div>
          <h2 className="font-semibold text-text text-2xl">Raw Material Details</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Class {class_type} - {material.name || "Unnamed Material"}
          </p>
        </div>
        <Button onClick={handleBack} variant="outline">
          ← Back to Store
        </Button>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">
                Basic Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Class Type:
                  </span>
                  <Badge color="primary" size="sm">
                    Class {material.class_type}
                  </Badge>
                </div>
                {material.name && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Name:
                    </span>
                    <span className="text-text">
                      {material.name}
                    </span>
                  </div>
                )}
                {material.type && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Type:
                    </span>
                    <span className="text-text">
                      {material.type}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Stock Status:
                  </span>
                  <Badge color={stockStatus.color} size="sm">
                    {stockStatus.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">
                Quantity Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {renderQuantityInfo()}
              </div>
            </div>

            {material.min_quantity !== undefined && (
              <div>
                <h4 className="text-md font-medium text-text mb-2">
                  Minimum Quantity
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  {material.min_quantity}
                </div>
              </div>
            )}
          </div>
          <RejectedQuantity id={id} class_type={class_type} />
        </div>

        {/* Specifications */}
        {material.other_specification && Object.keys(material.other_specification).length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text mb-4">
              Specifications
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              {renderSpecifications()}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {material.created_at && (
            <div>
              <h4 className="text-md font-medium text-text mb-2">
                Created At
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {new Date(material.created_at).toLocaleDateString()}
              </div>
            </div>
          )}

          {material.updated_at && (
            <div>
              <h4 className="text-md font-medium text-text mb-2">
                Last Updated
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {new Date(material.updated_at).toLocaleDateString()}
              </div>
            </div>
          )}

          {material.expiry_date && (
            <div>
              <h4 className="text-md font-medium text-text mb-2">
                Expiry Date
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {new Date(material.expiry_date).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Transition UI for any class with multiple quantity fields --- */}
      {material?.quantity && Object.keys(material.quantity).length > 1 && (
        <div className="max-w-2xl mx-auto mt-8">
          <div className="mb-2 text-lg font-semibold text-text">Transition Quantity</div>
          <form
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 flex flex-col md:flex-row items-center gap-4 shadow-sm"
            onSubmit={handleTransitionSubmit}
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">From</label>
              <select
                className="border rounded px-2 py-1 min-w-[120px]"
                value={fromStage}
                onChange={handleFromStageChange}
                disabled={transitionLoading}
              >
                {Object.keys(material.quantity).map(stage => (
                  <option key={stage} value={stage}>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)} (Available: {material.quantity[stage] || 0})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xl font-bold">→</span>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">To</label>
              <select
                className="border rounded px-2 py-1 min-w-[120px]"
                value={toStage}
                onChange={handleToStageChange}
                disabled={transitionLoading}
              >
                {Object.keys(material.quantity).map(stage => (
                  <option key={stage} value={stage}>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Quantity</label>
              <input
                type="number"
                min={1}
                max={material.quantity[fromStage] || 1}
                value={transitionQty}
                onChange={e => setTransitionQty(Math.max(1, Math.min(Number(e.target.value), material.quantity[fromStage] || 1)))}
                className="border rounded px-2 py-1 w-20"
                disabled={transitionLoading}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              loading={transitionLoading}
              className="mt-6 md:mt-0"
              disabled={
                transitionLoading ||
                !fromStage ||
                !toStage ||
                fromStage === toStage ||
                transitionQty < 1 ||
                transitionQty > (material.quantity[fromStage] || 0)
              }
            >
              Transition
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RawMaterialDetail; 
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Button from "../../../components/buttons/Button";
import useFinishedGoods from "../../../services/useFinishedGoods";
import useRawMaterials from "../../../services/useRawMaterials";
import useTransaction from "../../../services/useTransaction";
import DynamicTable from "../../../components/common/Table";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Input from "../../../components/forms/Input";
import DebouncedSearchInput from '../../../utils/DebouncedSearchInput';
import { useSelector } from "react-redux";
import { selectAuth } from "../../../features/authSlice";
import UnitsUpdateConfirmDialog from "../../../components/common/UnitsUpdateConfirmDialog";

const formatPowerLabel = (hp) => `${hp.toFixed(2)} HP`;

const normalizePowerString = (value = "") => {
  if (!value) return "";
  const trimmed = value.toString().trim().toUpperCase();
  const match = trimmed.match(/^(\d+(?:\.\d{0,2})?)(?:\s*HP)?$/);
  if (!match) return trimmed;
  const numeric = Number(match[1]);
  if (Number.isNaN(numeric)) return trimmed;
  return `${numeric.toFixed(2)} HP`;
};

const validatePower = (value) => {
  if (!value) return "Power is required";
  const normalized = normalizePowerString(value);
  return /^\d+\.\d{2} HP$/.test(normalized) ? "" : "Use format X.XX HP (e.g. 1.50 HP)";
};

const validateFrame = (value) => {
  if (value === null || value === "" || value === undefined) {
    return "Frame size is required";
  }
  const numeric = Number(value);
  if (!Number.isInteger(numeric)) return "Frame size must be a whole number";
  if (numeric <= 0) return "Frame size must be positive";
  return "";
};

const ViewFinishedGood = () => {
  const { id } = useParams();
  const { getFinishedGoodById, updateFinishedGood, updateFinishedGoodDetails, getModalConfig, getAllFinishedGoods } = useFinishedGoods();
  const { getRawMaterialsByClass } = useRawMaterials();
  const { updateFinishedGoodUnits } = useTransaction();
  const queryClient = useQueryClient();
  const auth = useSelector(selectAuth);
  const isDeveloper = auth?.user?.role?.toUpperCase() === "DEVELOPER";

  // Fetch model config and all finished goods to build power-frame mappings
  const { data: modelConfig } = useQuery({
    queryKey: ["modelConfig"],
    queryFn: () => getModalConfig(),
  });

  const { data: allFinishedGoods } = useQuery({
    queryKey: ["allFinishedGoods"],
    queryFn: () => getAllFinishedGoods(),
  });

  // Build powerFrameOptions dynamically from backend data
  const powerFrameOptions = useMemo(() => {
    if (!allFinishedGoods || !Array.isArray(allFinishedGoods)) return [];
    
    const powerFrameMap = new Map();
    
    // Extract power-frame mappings from all finished goods
    allFinishedGoods.forEach((fg) => {
      if (fg.power && fg.other_specification?.motor_frame_size != null) {
        const powerStr = fg.power.trim().toUpperCase();
        const frame = Number(fg.other_specification.motor_frame_size);
        
        // Extract numeric HP value from power string (e.g., "1.50 HP" -> 1.5)
        const hpMatch = powerStr.match(/^(\d+(?:\.\d+)?)/);
        if (hpMatch && !isNaN(frame)) {
          const hp = parseFloat(hpMatch[1]);
          // Keep the first frame size found for each power, or update if different
          if (!powerFrameMap.has(hp) || powerFrameMap.get(hp) !== frame) {
            powerFrameMap.set(hp, frame);
          }
        }
      }
    });

    // Convert to array and sort by HP
    return Array.from(powerFrameMap.entries())
      .map(([hp, frame]) => ({ hp, frame }))
      .sort((a, b) => a.hp - b.hp);
  }, [allFinishedGoods]);

  // Get unique powers from model config
  const availablePowers = useMemo(() => {
    if (!modelConfig || typeof modelConfig !== 'object') return [];
    const allPowers = new Set();
    Object.values(modelConfig).forEach((model) => {
      if (model && model.powers && Array.isArray(model.powers)) {
        model.powers.forEach((power) => allPowers.add(power.trim()));
      }
    });
    return Array.from(allPowers).sort();
  }, [modelConfig]);

  const uniqueFrameOptions = useMemo(() => {
    return [...new Set(powerFrameOptions.map((item) => item.frame))].sort((a, b) => a - b);
  }, [powerFrameOptions]);

  // Helper function to get frame for a given power value
  const getFrameForPower = (value) => {
    const normalized = normalizePowerString(value);
    const match = powerFrameOptions.find((option) => formatPowerLabel(option.hp) === normalized);
    return match ? match.frame : null;
  };

  const [unitsInput, setUnitsInput] = useState("");
  const [unitsError, setUnitsError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["finishedGoodById", id],
    queryFn: () => getFinishedGoodById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const updateDetailsMutation = useMutation({
    mutationFn: (detailsData) => updateFinishedGoodDetails(id, detailsData),
    onSuccess: () => {
      queryClient.invalidateQueries(["finishedGoodById", id]);
      toast.success("Finished good details updated successfully");
      setIsEditingDetails(false);
    },
    onError: (error) => {
      console.error("Update details error:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Error updating finished good details";
      const pendingOrders = error?.response?.data?.pendingSalesOrders;
      
      if (pendingOrders && pendingOrders.length > 0) {
        // Show detailed error with pending sales orders
        const orderList = pendingOrders.map(order => `SO-${order.order_id} (${order.customer_name}) - ${order.status}`).join(', ');
        toast.error(`${errorMessage}. Pending orders: ${orderList}`, { duration: 8000 });
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const [finishedGood, setFinishedGood] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editingDetails, setEditingDetails] = useState({
    model: "",
    power: "",
    type: "", 
    ratio: "",
    base_price: "",
    gst_slab: "",
    frame: null,
  });
  const [detailErrors, setDetailErrors] = useState({
    power: "",
    frame: "",
  });
  const [searchTerm, setSearchTerm] = useState({
    classA: "",
    classB: "",
    classC: "",
  });
  const [editingData, setEditingData] = useState({
    classA: [],
    classB: [],
    classC: [],
  });

  useEffect(() => {
    if (data) {
      setFinishedGood(data);
      setEditingData({
        classA: data.classA || [],
        classB: data.classB || [],
        classC: data.classC || [],
      });
      setEditingDetails({
        model: data.model || "",
        power: normalizePowerString(data.power || ""),
        type: data.type || "",
        ratio: data.ratio || "",
        base_price: data.base_price || "",
        gst_slab: data.gst_slab || "",
        frame: data?.other_specification?.motor_frame_size != null
          ? Number(data.other_specification.motor_frame_size)
          : null,
      });
      setDetailErrors({
        power: "",
        frame: "",
      });
    }
  }, [data]);

  const mapToTable = (arr) => {
    if (!arr || !Array.isArray(arr)) return { header: [], item: [] };
    return {
      header: ["Name", "Type", "Quantity"],
      item: arr.map(({ raw_material, quantity }) => ({
        id: raw_material._id,
        data: [raw_material.name, raw_material.type, quantity],
      })),
    };
  };

  const handleDelete = (classType, id) => {
    setEditingData((prev) => ({
      ...prev,
      [classType]: prev[classType].filter(
        (item) => item.raw_material._id !== id
      ),
    }));
  };

  const handleQuantityChange = (classType, id, newQty) => {
    setEditingData((prev) => ({
      ...prev,
      [classType]: prev[classType].map((item) =>
        item.raw_material._id === id ? { ...item, quantity: newQty } : item
      ),
    }));
  };

  const handleSearchInputFocus = (classType) => {
    setSearchTerm((prev) => {
      const cleared = { ...prev };
      Object.keys(cleared).forEach((key) => {
        if (key !== classType) cleared[key] = "";
      });
      return cleared;
    });
  };

  const handleSelectSearchItem = (classType, item) => {
    if (!editingData[classType].find((r) => r.raw_material._id === item._id)) {
      setEditingData((prev) => ({
        ...prev,
        [classType]: [...prev[classType], { raw_material: item, quantity: 1 }],
      }));
    }
    setSearchTerm((prev) => ({ ...prev, [classType]: "" }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        classA: editingData.classA.map((item) => ({
          raw_material: item.raw_material._id,
          quantity: item.quantity,
        })),
        classB: editingData.classB.map((item) => ({
          raw_material: item.raw_material._id,
          quantity: item.quantity,
        })),
        classC: editingData.classC.map((item) => ({
          raw_material: item.raw_material._id,
          quantity: item.quantity,
        })),
      };
      await updateFinishedGood(id, payload);
      toast.success("Finished Good updated successfully");
      queryClient.invalidateQueries(["finishedGoodById", id]);
      setIsEditing(false);
    } catch (err) {
      console.error("Update raw materials error:", err);
      const errorMessage = err?.response?.data?.error || err?.message || "Update failed";
      const pendingOrders = err?.response?.data?.pendingSalesOrders;
      
      if (pendingOrders && pendingOrders.length > 0) {
        // Show detailed error with pending sales orders
        const orderList = pendingOrders.map(order => `SO-${order.order_id} (${order.customer_name}) - ${order.status}`).join(', ');
        toast.error(`${errorMessage}. Pending orders: ${orderList}`, { duration: 8000 });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    if (name === "power") {
      const frameForPower = getFrameForPower(value);
      setEditingDetails((prev) => {
        const newFrame = frameForPower ?? prev.frame;
        const nextState = {
          ...prev,
          power: value,
          frame: newFrame,
        };
        setDetailErrors((prevErrors) => ({
          ...prevErrors,
          power: validatePower(value),
          frame: validateFrame(newFrame),
        }));
        return nextState;
      });
      return;
    }
    if (name === "frame") {
      const numeric = value === "" ? null : Number(value);
      setEditingDetails((prev) => ({
        ...prev,
        frame: numeric,
      }));
      setDetailErrors((prev) => ({
        ...prev,
        frame: validateFrame(numeric),
      }));
      return;
    }
    setEditingDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const availableDetailFrameOptions = useMemo(() => {
    if (!editingDetails.power) {
      return uniqueFrameOptions;
    }
    const frameMatch = getFrameForPower(editingDetails.power);
    if (frameMatch) {
      return [frameMatch];
    }
    return uniqueFrameOptions;
  }, [editingDetails.power]);

  const handleDetailsPowerBlur = () => {
    setEditingDetails((prev) => {
      const formatted = normalizePowerString(prev.power);
      const frameForPower = getFrameForPower(formatted);
      setDetailErrors((prevErrors) => ({
        ...prevErrors,
        power: validatePower(formatted),
        frame: validateFrame(frameForPower ?? prev.frame),
      }));
      return {
        ...prev,
        power: formatted,
        frame: frameForPower ?? prev.frame,
      };
    });
  };

  const handleDetailsFrameBlur = () => {
    setDetailErrors((prev) => ({
      ...prev,
      frame: validateFrame(editingDetails.frame),
    }));
  };

  const handleDetailsPowerPresetSelect = (e) => {
    const { value } = e.target;
    if (!value) return;
    handleDetailsChange({ target: { name: "power", value } });
  };

  const handleDetailsFramePresetSelect = (e) => {
    const { value } = e.target;
    handleDetailsChange({ target: { name: "frame", value } });
  };

  const handleSaveDetails = () => {
    if (!editingDetails.model || !editingDetails.power || !editingDetails.type || !editingDetails.ratio || !editingDetails.gst_slab) {
      toast.error("All fields are required");
      return;
    }
    const normalizedPower = normalizePowerString(editingDetails.power);
    const powerError = validatePower(normalizedPower);
    const frameError = validateFrame(editingDetails.frame);

    if (powerError || frameError) {
      setDetailErrors({
        power: powerError,
        frame: frameError,
      });
      toast.error("Please fix validation errors before saving.");
      return;
    }

    setEditingDetails((prev) => ({
      ...prev,
      power: normalizedPower,
    }));

    const payload = {
      ...editingDetails,
      power: normalizedPower,
      other_specification: editingDetails.frame != null
        ? { motor_frame_size: editingDetails.frame }
        : null,
    };
    updateDetailsMutation.mutate(payload);
  };

  const handleCancelDetails = () => {
    setEditingDetails({
      model: finishedGood?.model || "",
      power: normalizePowerString(finishedGood?.power || ""),
      type: finishedGood?.type || "",
      ratio: finishedGood?.ratio || "",
      base_price: finishedGood?.base_price || "",
      gst_slab: finishedGood?.gst_slab || "",
      frame: finishedGood?.other_specification?.motor_frame_size != null
        ? Number(finishedGood.other_specification.motor_frame_size)
        : null,
    });
    setDetailErrors({
      power: "",
      frame: "",
    });
    setIsEditingDetails(false);
  };

  const updateUnitsMutation = useMutation({
    mutationFn: ({ value, label }) => updateFinishedGoodUnits(id, { value, label }),
    onSuccess: () => {
      queryClient.invalidateQueries(["finishedGoodById", id]);
      toast.success("Units updated successfully");
      setUnitsInput("");
      setUnitsError("");
      setShowConfirmDialog(false);
      setPendingUpdate(null);
    },
    onError: (error) => {
      console.error("Update units error:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Error updating units";
      toast.error(errorMessage);
    },
  });

  const handleUnitsInputChange = (e) => {
    const value = e.target.value;
    setUnitsInput(value);
    
    // Validate integer
    if (value === "") {
      setUnitsError("");
      return;
    }
    
    const numValue = Number(value);
    if (!Number.isInteger(numValue) || numValue < 0) {
      setUnitsError("Please enter a valid positive integer");
    } else {
      setUnitsError("");
    }
  };

  const handleUnitsSubmit = () => {
    if (!unitsInput || unitsInput === "") {
      setUnitsError("Please enter a quantity");
      return;
    }

    const numValue = Number(unitsInput);
    if (!Number.isInteger(numValue) || numValue < 0) {
      setUnitsError("Please enter a valid positive integer");
      return;
    }

    const prevQty = finishedGood?.units || 0;
    const enteredQty = numValue;

    // Always show confirmation dialog
    setPendingUpdate({ prevQty, enteredQty });
    setShowConfirmDialog(true);
  };

  const handleConfirmDialog = (action) => {
    if (!pendingUpdate) return;

    const { prevQty, enteredQty } = pendingUpdate;
    const shouldAdd = action === "add";
    const finalQty = shouldAdd ? prevQty + enteredQty : enteredQty;
    const label = shouldAdd
      ? `Added ${enteredQty} units to ${finishedGood?.model_number || 'FG'} (Previous: ${prevQty}, New: ${finalQty})`
      : `Updated units for ${finishedGood?.model_number || 'FG'} (Previous: ${prevQty}, New: ${finalQty})`;

    updateUnitsMutation.mutate({
      value: finalQty,
      label: label,
    });

    setPendingUpdate(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading Finished Good...</p>
      </div>
    );
  }

  if (isError || !finishedGood) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Error loading data or finished good not found.</p>
      </div>
    );
  }

  const renderEditor = (classType) => (
    <div className="bg-background p-4 rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">
        Class {classType.slice(-1).toUpperCase()} Raw Materials
      </h3>
      <div className="space-y-2">
        {editingData[classType].map(({ raw_material, quantity }) => (
          <div
            key={raw_material._id}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border border-gray-300 dark:border-gray-600 p-2 rounded-md"
          >
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2  bg-white dark:bg-gray-800">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {raw_material.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({raw_material.type})
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                type="number"
                className="w-full sm:w-20"
                value={quantity}
                onChange={(e) =>
                  handleQuantityChange(
                    classType,
                    raw_material._id,
                    +e.target.value
                  )
                }
              />
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(classType, raw_material._id)}
                className="flex-shrink-0"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="relative">
        <DebouncedSearchInput
          value={searchTerm[classType]}
          onChange={(e) =>
            setSearchTerm((prev) => ({ ...prev, [classType]: e.target.value }))
          }
          onFocus={() => handleSearchInputFocus(classType)}
          placeholder={`Search Raw Material for Class ${classType.slice(-1).toUpperCase()}`}
          searchFn={async (term) => {
            try {
              const classTypeLetter = classType.replace('class', '').toUpperCase();
              const res = await getRawMaterialsByClass(classTypeLetter, { name: term });
              const selectedIds = editingData[classType].map((item) => item.raw_material._id);
              return (res.item || [])
                .map((row) => ({
                  _id: row.id,
                  name: row.data[1],
                  type: row.data[2],
                }))
                .filter((item) => !selectedIds.includes(item._id));
            } catch {
              return [];
            }
          }}
          onSelect={(item) => handleSelectSearchItem(classType, item)}
          renderResultItem={(rm) => `${rm.name} - ${rm.type}`}
        />
      </div>
    </div>
  );

  const headHeader = [
    "Model Number",
    "Model",
    "Type",
    "Power",
    "Ratio",
  ];

  const headData = {
    header: headHeader,
    item: [
      {
        id: finishedGood.model_number,
        data: [
          finishedGood.model_number,
          finishedGood.model,
          finishedGood.type,
          finishedGood.power,
          finishedGood.ratio,
        ],
      },
    ],
  };

  return (
    <div className="p-1 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      {/* Header with Edit Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Finished Good Details</h2>
        {isDeveloper && (
          <>
            {isEditingDetails ? (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleCancelDetails}
                  className="bg-rose-500 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveDetails}
                  loading={updateDetailsMutation.isPending}
                  className="text-sm"
                >
                  Save Details
                </Button>
              </div>
            ) : isEditing ? (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="bg-rose-500 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  className="text-sm"
                >
                  Save Raw Materials
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="primary"
                  onClick={() => setIsEditingDetails(true)}
                  className="w-full sm:w-auto text-sm"
                >
                  Edit Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto text-sm"
                >
                  Edit Raw Materials
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Details Table */}
      <div className="overflow-x-auto rounded-lg shadow-md">
        {isEditingDetails ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Finished Good Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <Input
                  name="model"
                  value={editingDetails.model}
                  onChange={handleDetailsChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Power</label>
                <div className="flex gap-2">
                  <Input
                    name="power"
                    value={editingDetails.power}
                    onChange={handleDetailsChange}
                    onBlur={handleDetailsPowerBlur}
                    className="w-full"
                    placeholder="e.g. 1.50 HP"
                  />
                  <select
                    value={
                      availablePowers.includes(normalizePowerString(editingDetails.power))
                        ? normalizePowerString(editingDetails.power)
                        : ""
                    }
                    onChange={handleDetailsPowerPresetSelect}
                    className="w-32 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    {availablePowers.map((power) => (
                      <option key={power} value={power}>
                        {power}
                      </option>
                    ))}
                  </select>
                </div>
                {detailErrors.power && (
                  <p className="mt-1 text-xs text-red-500">{detailErrors.power}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  value={editingDetails.type}
                  onChange={handleDetailsChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="Base (Foot)">Base (Foot)</option>
                  <option value="Vertical (Flange)">Vertical (Flange)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ratio</label>
                <Input
                  name="ratio"
                  value={editingDetails.ratio}
                  onChange={handleDetailsChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frame</label>
                <div className="flex gap-2">
                  <Input
                    name="frame"
                    value={editingDetails.frame ?? ""}
                    onChange={handleDetailsChange}
                    onBlur={handleDetailsFrameBlur}
                    className="w-full"
                    placeholder="e.g. 132"
                    disabled={!editingDetails.power}
                  />
                  <select
                    value={
                      editingDetails.frame != null && availableDetailFrameOptions.includes(editingDetails.frame)
                        ? String(editingDetails.frame)
                        : ""
                    }
                    onChange={handleDetailsFramePresetSelect}
                    className="w-32 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!editingDetails.power}
                  >
                    <option value="">Select</option>
                    {availableDetailFrameOptions.map((option) => (
                      <option key={option} value={String(option)}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                {detailErrors.frame && (
                  <p className="mt-1 text-xs text-red-500">{detailErrors.frame}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Price</label>
                <Input
                  name="base_price"
                  value={editingDetails.base_price}
                  onChange={handleDetailsChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GST Slab</label>
                <select
                  name="gst_slab"
                  value={editingDetails.gst_slab}
                  onChange={handleDetailsChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select GST slab</option>
                  <option value="0">0 %</option>
                  <option value="0.25">0.25 %</option>
                  <option value="3">3 %</option>
                  <option value="5">5 %</option>
                  <option value="18">18 %</option>
                  <option value="40">40 %</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <DynamicTable header={headData.header} tableData={headData} />
        )}
      </div>

      {/* Units Update Card */}
      <div className="bg-background dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2">
          Update Units
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Previous Quantity
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100">
              {finishedGood?.units || 0}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter Quantity
            </label>
            <Input
              type="number"
              value={unitsInput}
              onChange={handleUnitsInputChange}
              placeholder="Enter quantity (integer only)"
              className="w-full"
              min="0"
              step="1"
            />
            {unitsError && (
              <p className="mt-1 text-xs text-red-500">{unitsError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter the quantity you want to set as final, or a quantity to add to the previous value.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleUnitsSubmit}
            loading={updateUnitsMutation.isPending}
            disabled={!unitsInput || unitsError !== ""}
            className="w-full"
          >
            Update Units
          </Button>
        </div>
      </div>

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
        modelNumber={finishedGood?.model_number}
      />

      {/* Raw Materials Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isEditing ? (
          <>
            {renderEditor("classA")}
            {renderEditor("classB")}
            {renderEditor("classC")}
          </>
        ) : (
          <>
            {finishedGood.classA?.length > 0 && (
              <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">
                  Class A Raw Materials
                </h3>
                <div className="overflow-x-auto">
                  <DynamicTable
                    header={["Name", "Type", "Quantity"]}
                    tableData={mapToTable(finishedGood.classA)}
                  />
                </div>
              </div>
            )}
            {finishedGood.classB?.length > 0 && (
              <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">
                  Class B Raw Materials
                </h3>
                <div className="overflow-x-auto">
                  <DynamicTable
                    header={["Name", "Type", "Quantity"]}
                    tableData={mapToTable(finishedGood.classB)}
                  />
                </div>
              </div>
            )}
            {finishedGood.classC?.length > 0 && (
              <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">
                  Class C Raw Materials
                </h3>
                <div className="overflow-x-auto">
                  <DynamicTable
                    header={["Name", "Type", "Quantity"]}
                    tableData={mapToTable(finishedGood.classC)}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewFinishedGood;
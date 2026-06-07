import React, {useState, useEffect, useRef} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "react-hot-toast";
import {useNavigate} from "react-router-dom";
import useProduction from "../../services/useProduction";
import useFinishedGoods from "../../services/useFinishedGoods";
import Button from "../../components/buttons/Button";
import {LuTrash} from "react-icons/lu";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DailyProduction = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [model, setModel] = useState("");
  const [type, setType] = useState("");
  const [ratio, setRatio] = useState("");
  const [power, setPower] = useState("");
  const [quantity, setQuantity] = useState("");
  const [items, setItems] = useState([]);
  const [rawMaterialInfo, setRawMaterialInfo] = useState(null);
  const [checkingMaterials, setCheckingMaterials] = useState(false);
  const [productionDate, setProductionDate] = useState(new Date());

  const {addDailyProduction, checkRawMaterialAvailability} = useProduction();
  const {getModalConfig} = useFinishedGoods();
  
  // Use ref to store the latest checkRawMaterialAvailability function
  const checkRawMaterialAvailabilityRef = useRef(checkRawMaterialAvailability);
  checkRawMaterialAvailabilityRef.current = checkRawMaterialAvailability;

  // Fetch modal config for dropdowns
  const {
    data: modelConfig,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["modalConfig"],
    queryFn: async () => {
      const data = await getModalConfig();
      Object.keys(data).forEach((modelKey) => {
        data[modelKey].powers = data[modelKey].powers.map((item) => item);
        const ratios = data[modelKey].ratios;
        const normalizedRatios = {};
        Object.keys(ratios).forEach((powerKey) => {
          normalizedRatios[powerKey.toString()] = ratios[powerKey];
        });
        data[modelKey].ratios = normalizedRatios;
      });
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const [availablePowers, setAvailablePowers] = useState([]);
  const [availableRatios, setAvailableRatios] = useState([]);

  useEffect(() => {
    if (model && modelConfig?.[model]) {
      setAvailablePowers(modelConfig[model].powers);
    } else {
      setAvailablePowers([]);
    }
    setPower("");
    setRatio("");
  }, [model, modelConfig]);

  useEffect(() => {
    if (
      model &&
      power &&
      modelConfig?.[model]?.ratios &&
      modelConfig[model].ratios[power.toString()]
    ) {
      const sortedRatios = [
        ...modelConfig[model].ratios[power.toString()],
      ].sort((a, b) => {
        return parseFloat(a) - parseFloat(b);
      });
      setAvailableRatios(sortedRatios);
    } else {
      setAvailableRatios([]);
    }
    setRatio("");
  }, [power, model, modelConfig]);

  // Check raw material availability when all fields are filled
  useEffect(() => {
    const checkMaterials = async () => {
      if (!model || !type || !ratio || !power) {
        setRawMaterialInfo(null);
        return;
      }
      
      setCheckingMaterials(true);
      try {
        const response = await checkRawMaterialAvailabilityRef.current({
          model,
          type,
          ratio,
          power: power.toString()
        });
        setRawMaterialInfo(response.data);
      } catch (error) {
        console.error("Error checking raw materials:", error);
        setRawMaterialInfo(null);
      } finally {
        setCheckingMaterials(false);
      }
    };

    checkMaterials();
  }, [model, type, ratio, power]);

  const {mutate: addProduction, isPending} = useMutation({
    mutationFn: (productionData) => addDailyProduction(productionData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({queryKey: ["finished-goods"]});
      queryClient.invalidateQueries({queryKey: ["pendingProductions"]});
      queryClient.invalidateQueries({queryKey: ["modalConfig"]});

      // Show success message
      toast.success(response.message);

      // Check if there are errors (partial success scenario)
      if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
        // Display each error prominently
        response.errors.forEach(error => {
          const itemIdentifier = error.itemIdentifier || 
            `${error.item?.model || 'N/A'}-${error.item?.type || 'N/A'}-${error.item?.ratio || 'N/A'}-${error.item?.power || 'N/A'}`;
          
          if (error.rawMaterialLimits) {
            const limitingMaterials = error.rawMaterialLimits
              .filter(rm => rm.maxProducible < (error.requestedQuantity || error.item?.quantity || 0))
              .map(rm => `${rm.material}: Available ${rm.available}, Required ${rm.requiredPerUnit * (error.requestedQuantity || error.item?.quantity || 0)}, Max Producible: ${rm.maxProducible}`)
              .join('\n');
            
            const errorMessage = `❌ ${itemIdentifier} - Insufficient BOM Materials\n\nRequested: ${error.requestedQuantity || error.item?.quantity || 'N/A'}\nMaximum Producible: ${error.maxProducible || 0}\n\nLimiting Materials:\n${limitingMaterials}`;
            
            toast.error(
              () => (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <pre className="whitespace-pre-line text-sm leading-relaxed">
                      {errorMessage}
                    </pre>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(errorMessage);
                      toast.success('Copied to clipboard!', { duration: 2000 });
                    }}
                    className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copy error details"
                  >
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              ),
              {
                duration: 10000, // Show for 10 seconds to allow time for reading and copying
                style: {
                  maxWidth: '600px',
                  minWidth: '450px',
                  padding: '12px 16px'
                }
              }
            );
          } else {
            // Generic error message
            const errorMessage = error.error || `Failed to add ${itemIdentifier}`;
            toast.error(
              () => (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <pre className="whitespace-pre-line text-sm leading-relaxed">
                      {`❌ ${itemIdentifier}\n${errorMessage}`}
                    </pre>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(errorMessage);
                      toast.success('Copied to clipboard!', { duration: 2000 });
                    }}
                    className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copy error details"
                  >
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              ),
              {
                duration: 8000,
                style: {
                  maxWidth: '600px',
                  minWidth: '450px',
                  padding: '12px 16px'
                }
              }
            );
          }
        });

        // Show summary toast
        toast(
          () => (
            <div className="flex items-center gap-2">
              <span className="text-sm">
                ⚠️ Partial Success: {response.success || response.results?.length || 0} succeeded, {response.failed || response.errors?.length || 0} failed
              </span>
            </div>
          ),
          {
            duration: 5000,
            icon: '⚠️',
          }
        );
      }

      // Only reset and navigate if all items succeeded
      if (!response.errors || response.errors.length === 0) {
        // Reset form
        setModel("");
        setType("");
        setRatio("");
        setPower("");
        setQuantity("");
        setItems([]);

        // Navigate back to production page
        navigate("/production");
      } else {
        // If there are errors, keep the form but remove successfully added items
        // Remove items that were successfully added from the items list
        if (response.results && Array.isArray(response.results)) {
          const successfulItemIds = new Set(
            response.results.map(result => {
              const fg = result.finished_good;
              return `${fg.model}-${fg.type}-${fg.ratio}-${fg.power}`;
            })
          );
          
          setItems(prevItems => 
            prevItems.filter(item => {
              const itemId = `${item.model}-${item.type}-${item.ratio}-${item.power}`;
              return !successfulItemIds.has(itemId);
            })
          );
        }
      }
    },
    onError: (err) => {
      console.error("Daily production failed:", err);
      
      // Handle detailed raw material errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errors = err.response.data.errors;
        errors.forEach(error => {
          if (error.rawMaterialLimits) {
            const limitingMaterials = error.rawMaterialLimits
              .filter(rm => rm.maxProducible < error.item.quantity)
              .map(rm => `${rm.material}: Available ${rm.available}, Required ${rm.requiredPerUnit * error.item.quantity}`)
              .join('\n');
            
            const errorMessage = `Insufficient raw materials for ${error.item.model}:\n${limitingMaterials}`;
            
            toast.error(
              () => (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <pre className="whitespace-pre-line text-sm leading-relaxed">
                      {errorMessage}
                    </pre>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(errorMessage);
                      toast.success('Copied to clipboard!', { duration: 2000 });
                    }}
                    className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copy error details"
                  >
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              ),
              {
                duration: 8000, // Show for 8 seconds to allow time for copying
                style: {
                  maxWidth: '600px',
                  minWidth: '450px',
                  padding: '12px 16px'
                }
              }
            );
          } else {
            toast.error(error.error || "Production failed");
          }
        });
      } else {
        toast.error(
          err.response?.data?.error ||
          err.response?.error ||
          "Failed to add daily production. Please try again."
        );
      }
    },
  });

  const handleAddItem = () => {
    if (!model || !type || !ratio || !quantity || !power) {
      toast.error("Please fill all fields before adding an item.");
      return;
    }

    const newQuantity = parseFloat(quantity);

    // Check raw material availability
    if (rawMaterialInfo && newQuantity > rawMaterialInfo.max_producible_quantity) {
      toast.error(`Cannot produce ${newQuantity} units. Maximum producible: ${rawMaterialInfo.max_producible_quantity}`);
      return;
    }

    if (rawMaterialInfo && rawMaterialInfo.max_producible_quantity === 0) {
      toast.error("Cannot produce - insufficient raw materials");
      return;
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.model === model &&
          item.power === power.toString() &&
          item.ratio === ratio &&
          item.type === type
      );

      if (existingIndex !== -1) {
        const updatedItems = [...prevItems];
        const totalQuantity = updatedItems[existingIndex].quantity + newQuantity;
        
        // Check if total quantity exceeds raw material limits
        if (rawMaterialInfo && totalQuantity > rawMaterialInfo.max_producible_quantity) {
          toast.error(`Total quantity (${totalQuantity}) exceeds maximum producible (${rawMaterialInfo.max_producible_quantity})`);
          return prevItems;
        }
        
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: totalQuantity,
        };
        return updatedItems;
      } else {
        const newItem = {
          id: Date.now(),
          model,
          type,
          ratio,
          quantity: newQuantity,
          power: power.toString(),
        };
        return [...prevItems, newItem];
      }
    });
    setModel("");
    setType("");
    setRatio("");
    setQuantity("");
    setPower("");
  };

  const handleRemoveItem = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Please add at least one finished good before submitting.");
      return;
    }

    const payload = {
      finished_goods: items.map((item) => ({
        model: item.model,
        type: item.type,
        ratio: item.ratio,
        power: item.power, // Keep as string like sales creation
        quantity: item.quantity,
      })),
      date: productionDate ? productionDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    };

    addProduction(payload);
  };

  const handleBack = () => {
    navigate("/production");
  };

  if (isLoading)
    return <div className="p-8 text-center">Loading form config...</div>;
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">
        Error loading form config
      </div>
    );

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-background text-text space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-text">Daily Production</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add daily production quantities for finished goods
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleBack}
          disabled={isPending}
        >
          Back to Production
        </Button>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Production Date Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Production Date *
              </label>
              <DatePicker
                selected={productionDate}
                onChange={(date) => setProductionDate(date)}
                dateFormat="dd-MM-yyyy"
                placeholderText="Select a date"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:white"
                required
              />
            </div>
            <div className="flex-1 text-sm text-gray-500 dark:text-gray-400 md:mt-6">
              This date will be used for production, stock usage, and history logs.
            </div>
          </div>

          {/* Add Item Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model *
              </label>
              <select
                name="model"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  setPower("");
                  setRatio("");
                }}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Model</option>
                {Object.keys(modelConfig || {}).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Power *
              </label>
              <select
                name="power"
                value={power}
                onChange={(e) => {
                  setPower(e.target.value);
                  setRatio("");
                }}
                disabled={!availablePowers.length}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="">Select Power</option>
                {availablePowers.map((p) => (
                  <option key={p} value={p.toString()}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ratio *
              </label>
              <select
                name="ratio"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                disabled={!availableRatios.length}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="">Select Ratio</option>
                {availableRatios.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Type</option>
                <option value="Base (Foot)">Base (Foot)</option>
                <option value="Vertical (Flange)">Vertical (Flange)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity *
                {rawMaterialInfo && (
                  <span className="text-sm text-blue-600 dark:text-blue-400 ml-2">
                    (Max: {rawMaterialInfo.max_producible_quantity})
                  </span>
                )}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Quantity"
                min="1"
                max={rawMaterialInfo?.max_producible_quantity || undefined}
                step="1"
              />
              {rawMaterialInfo && rawMaterialInfo.max_producible_quantity === 0 && (
                <p className="text-red-500 text-sm mt-1">
                  Cannot produce - insufficient raw materials
                </p>
              )}
              {rawMaterialInfo && rawMaterialInfo.max_producible_quantity > 0 && (
                <p className="text-green-600 text-sm mt-1">
                  Can produce up to {rawMaterialInfo.max_producible_quantity} units
                </p>
              )}
            </div>
          </div>

          {/* Raw Material Information */}
          {rawMaterialInfo && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Raw Material Availability
              </h4>
              <div className="space-y-2">
                {rawMaterialInfo.raw_material_limits.map((material, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {material.material_name} ({material.material_type})
                    </span>
                    <span className={`font-medium ${
                      material.max_producible > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {material.available_quantity} / {material.required_per_unit} per unit
                      {material.max_producible > 0 && ` (Max: ${material.max_producible})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Item Button */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={handleAddItem}
              disabled={!model || !type || !ratio || !quantity || !power || checkingMaterials}
            >
              {checkingMaterials ? "Checking Materials..." : "Add Item"}
            </Button>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Production Items ({items.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        Model
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        Type
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        Power
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        Ratio
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
                        Quantity
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {item.model}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {item.type}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {item.power}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {item.ratio}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <LuTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              className="px-6"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-6"
              disabled={isPending || items.length === 0}
            >
              {isPending
                ? "Adding Production..."
                : `Add Daily Production (${items.length} items)`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyProduction;

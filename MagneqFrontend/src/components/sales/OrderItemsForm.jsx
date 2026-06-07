import React, { useEffect, useState } from "react";
import Select from "../forms/Select";
import Input from "../forms/Input";
import Badge from "../common/Badge";
import Label from "../forms/Label";
import { useQuery } from "@tanstack/react-query";
import useFinishedGoods from "../../services/useFinishedGoods";
import DaynamicTable from "../common/Table";
import { LuTrash } from "react-icons/lu";
import { toast } from "react-hot-toast";

const OrderItemsForm = ({
  items,
  setItems,
  model,
  setModel,
  type,
  setType,
  ratio,
  setRatio,
  quantity,
  setQuantity,
  power,
  setPower,
  isAdminEditingApproved,
}) => {
  const { getModalConfig } = useFinishedGoods();
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
  }, [model, modelConfig, setPower, setRatio]);

  useEffect(() => {
    if (
      model &&
      power &&
      modelConfig?.[model]?.ratios &&
      modelConfig[model].ratios[power.toString()]
    ) {
      const sortedRatios = [...modelConfig[model].ratios[power.toString()]].sort((a, b) => {
        return parseFloat(a) - parseFloat(b);
      });
      setAvailableRatios(sortedRatios);
    } else {
      setAvailableRatios([]);
    }
    setRatio("");
  }, [power, model, modelConfig, setRatio]);

  const handleAddItem = () => {
    if (!model || !type || !ratio || !quantity || !power) {
      toast.error("Please fill all fields before adding an item.");
      return;
    }

    const newQuantity = parseFloat(quantity);

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
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + newQuantity,
          // Preserve invoiced_quantity for existing items
        };
        return updatedItems;
      } else {
        const newItem = {
          id: Date.now(),
          model,
          type,
          ratio,
          quantity: newQuantity,
          invoiced_quantity: 0, // New items have no invoiced quantity
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

  const handleDeleteItem = (itemToDelete) => {
    // Check if admin is editing approved order and item has invoiced quantity
    if (isAdminEditingApproved && (itemToDelete.invoiced_quantity || 0) > 0) {
      toast.error(`Cannot remove item with invoiced quantity. This item has ${itemToDelete.invoiced_quantity} invoiced units.`);
      return;
    }

    // For non-admin users or unapproved orders, allow deletion
    // For admin editing approved orders, only allow if no invoiced quantity
    setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    toast.success("Item removed successfully");
  };

  if (isLoading) return <p>Loading form config...</p>;
  if (isError) return <p>Error loading form config</p>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end mt-8">
        <div>
          <Label htmlFor="model">Model</Label>
          <Select
            name="model"
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setPower("");
              setRatio("");
            }}
          >
            <option value="">Select Model</option>
            {Object.keys(modelConfig || {}).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="power">Power</Label>
          <Select
            name="power"
            value={power}
            onChange={(e) => {
              setPower(e.target.value);
              setRatio("");
            }}
            disabled={!availablePowers.length}
          >
            <option value="">Select Power</option>
            {availablePowers.map((p) => (
              <option key={p} value={p.toString()}>
                {p}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="ratio">Ratio</Label>
          <Select
            name="ratio"
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
            disabled={!availableRatios.length}
          >
            <option value="">Select Ratio</option>
            {availableRatios.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="Base (Foot)">Base (Foot)</option>
            <option value="Vertical (Flange)">Vertical (Flange)</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            name="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-6">
        <Badge variant="light" color="primary" size="sm">
          <button type="button" onClick={handleAddItem}>
            + Add Item
          </button>
        </Badge>
      </div>

      {items.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <DaynamicTable
            header={["Model", "Power", "Ratio", "Type", "Order Quantity", "Invoiced Quantity", "Actions"]}
            tableData={{
              item: items.map((item) => ({
                id: item.id,
                data: [
                  item.model,
                  item.power,
                  item.ratio,
                  item.type,
                  item.quantity,
                  <span className={isAdminEditingApproved && (item.invoiced_quantity || 0) > 0 ? "text-orange-600 font-semibold" : ""}>
                    {item.invoiced_quantity || 0}
                  </span>,
                  <Badge 
                    color={isAdminEditingApproved && (item.invoiced_quantity || 0) > 0 ? "secondary" : "primary"} 
                    key={item.id}
                  >
                    <button
                      className={`flex items-center gap-2 ${
                        isAdminEditingApproved && (item.invoiced_quantity || 0) > 0 
                          ? "text-gray-400 cursor-not-allowed" 
                          : "text-red-400"
                      }`}
                      onClick={() => handleDeleteItem(item)}
                      disabled={isAdminEditingApproved && (item.invoiced_quantity || 0) > 0}
                      title={
                        isAdminEditingApproved && (item.invoiced_quantity || 0) > 0 
                          ? `Cannot delete - ${item.invoiced_quantity} units invoiced`
                          : "Delete item"
                      }
                    >
                      <LuTrash className="p-0.5" />
                      {isAdminEditingApproved && (item.invoiced_quantity || 0) > 0 ? "Locked" : "Delete"}
                    </button>
                  </Badge>,
                ],
              })),
            }}
          />
        </div>
      )}
    </>
  );
};

export default OrderItemsForm;
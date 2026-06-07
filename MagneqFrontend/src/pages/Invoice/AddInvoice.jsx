import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Button from "../../components/buttons/Button";

import Badge from "../../components/common/Badge";
import OrderNameInput from "../../components/sales/OrderInputName";
import SalesOrderDropdown from "../../components/sales/SalesOrderDropdown";
import useSales from "../../services/useSales";
import useInvoice from "../../services/useInvoice";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi";

const AddInvoice = () => {
  const [salesId, setSalesId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [repName, setRepName] = useState("");
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ fg_id: "", quantity: 0 });
  const [sale, setSale] = useState({});
  const { getFgOfSales } = useSales();
  const { generateInvoice } = useInvoice();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: fgOptions = [], isLoading: fgLoading } = useQuery({
    queryKey: ["SalesFg", sale.id],
    queryFn: () => getFgOfSales(sale.id),
    enabled: !!sale.id,
  });

  const { mutate: createInvoice } = useMutation({
    mutationFn: generateInvoice,
    onSuccess: () => {
      toast.success("Invoice created successfully!");
      setItems([]);
      setSalesId("");
      setCustomerId("");
      setCustomerName("");
      setRepName("");
      setSale({});
      navigate("/invoice");
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to create invoice";
      toast.error(errorMessage);
    },
  });

  const handleAddItem = () => {
    if (!newItem.fg_id || newItem.quantity <= 0) {
      toast.error("Please select FG and enter quantity");
      return;
    }

    const existingItemIndex = items.findIndex(
      (item) => item.fg_id === newItem.fg_id
    );

    if (existingItemIndex !== -1) {
      const updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];
      const selectedFg = fgOptions.find((f) => f.id === newItem.fg_id);

      const newTotalQuantity = existingItem.quantity + newItem.quantity;

      if (selectedFg) {
        const maxQty = Math.min(
          selectedFg.remaining_quantity,
          selectedFg.stock_units
        );
        if (newTotalQuantity > maxQty) {
          toast.error(
            `Total quantity for ${selectedFg.model_number} cannot exceed ${maxQty}. Currently in table: ${existingItem.quantity}`
          );
          return;
        }
      }

      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newTotalQuantity,
      };
      setItems(updatedItems);
    } else {
      setItems([...items, newItem]);
    }

    setNewItem({ fg_id: "", quantity: 0 });
  };

  const handleCustomerSelect = (customerData) => {
    if (customerData?.id && customerData?.name) {
      setCustomerName(customerData.name);
      setCustomerId(customerData.id);
    }
  };

  const handleSubmit = () => {
    const payload = {
      sales_id: salesId,
      customer_id: customerId,
      items,
    };
    createInvoice(payload);
    queryClient.invalidateQueries({ queryKey: ["AllInvoices"] });
  };

  return (
    <div className="max-w-5xl shadow-lg border rounded-lg p-6 mx-auto px-4 sm:px-6 md:px-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-text">
          Create Invoice
        </h2>
        <Button
          onClick={() => navigate("/invoice")}
          variant="outlined"
          startIcon={<HiOutlineArrowLeft />}
        >
          Back to Invoice
        </Button>
      </div>

      {/* Sales & Customer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <OrderNameInput
          repName={repName}
          setRepName={setRepName} c
          customerName={customerName}
          setCustomerName={handleCustomerSelect}
          setCustomer={() => { }}
        />

        <SalesOrderDropdown
          customerId={customerId}
          salesId={salesId}
          setSalesId={setSalesId}
          setSale={setSale}
          className="bg-white dark:bg-gray-900"
        />
      </div>

      {/* Add Finished Good Items */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Add Finished Goods</h4>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <select
            value={newItem.fg_id}
            onChange={(e) => setNewItem({ ...newItem, fg_id: e.target.value })}
            className="border px-3 py-2 rounded w-full sm:w-1/2 bg-white dark:bg-gray-900"
            disabled={fgLoading || !fgOptions.length}
          >
            <option value="">Select Finished Good</option>
            {fgOptions.map((fg) => {
              const existingItem = items.find((item) => item.fg_id === fg.id);
              const existingQty = existingItem ? existingItem.quantity : 0;
              const maxAvailable = Math.min(
                fg.remaining_quantity,
                fg.stock_units
              );
              const remainingToInvoice = maxAvailable - existingQty;
              return (
                <option
                  key={fg.id}
                  value={fg.id}
                  disabled={fg.remaining_quantity <= 0 || remainingToInvoice <= 0}
                >
                  {fg.model_number} ({fg.remaining_quantity} left,{" "}
                  {fg.stock_units} stock)
                  {existingQty > 0 ? ` [${existingQty} in table]` : ""}
                  {remainingToInvoice <= 0 && existingQty > 0 ? " (MAXED)" : ""}
                </option>
              );
            })}
          </select>

          <input
            type="number"
            placeholder="Quantity"
            className="border px-3 py-2 rounded w-full sm:w-1/4 bg-white dark:bg-gray-900"
            value={newItem.quantity}
            min={1}
            max={(() => {
              const selectedFg = fgOptions.find((f) => f.id === newItem.fg_id);
              if (!selectedFg) return 0;
              const existingItem = items.find(
                (item) => item.fg_id === newItem.fg_id
              );
              const existingQty = existingItem ? existingItem.quantity : 0;
              const maxAvailable = Math.min(
                selectedFg.remaining_quantity,
                selectedFg.stock_units
              );
              return Math.max(0, maxAvailable - existingQty);
            })()}
            onChange={(e) => {
              const selectedFg = fgOptions.find((f) => f.id === newItem.fg_id);
              let qty = Number(e.target.value);
              if (selectedFg) {
                const existingItem = items.find(
                  (item) => item.fg_id === newItem.fg_id
                );
                const existingQty = existingItem ? existingItem.quantity : 0;
                const maxAvailable = Math.min(
                  selectedFg.remaining_quantity,
                  selectedFg.stock_units
                );
                const maxToAppend = maxAvailable - existingQty;

                if (qty > maxToAppend) {
                  toast.error(
                    `You can only add up to ${maxToAppend} more for this item.`
                  );
                  qty = maxToAppend;
                }
              }
              setNewItem({ ...newItem, quantity: qty });
            }}
          />
          <Button
            className="w-full sm:w-auto"
            onClick={handleAddItem}
            disabled={!newItem.fg_id || newItem.quantity <= 0}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Items Table */}
      {/* Items Table */}
      {items.length > 0 && (
        <div className="mb-6 overflow-x-auto border rounded-lg">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
              <tr>
                <th className="text-left px-4 py-2 font-medium border-b">
                  Finished Good
                </th>
                <th className="text-left px-4 py-2 font-medium border-b">
                  Quantity
                </th>
                <th className="text-left px-4 py-2 font-medium border-b">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => {
                const fg = fgOptions.find((f) => f.id === row.fg_id);
                return (
                  <tr
                    key={idx}
                    className={
                      idx % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50 dark:bg-gray-800"
                    }
                  >
                    <td className="px-4 py-2 border-b">
                      {fg ? fg.model_number : row.fg_id}
                    </td>
                    <td className="px-4 py-2 border-b">{row.quantity}</td>
                    <td className="px-4 py-2 border-b">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          setItems((prev) => prev.filter((_, i) => i !== idx))
                        }
                      >
                        <Badge color="error">Delete</Badge>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          className="mt-4 px-6 py-2 rounded-lg"
          onClick={handleSubmit}
          disabled={!salesId || !customerId || items.length === 0}
        >
          Submit Invoice
        </Button>
      </div>
    </div>
  );
};

export default AddInvoice;

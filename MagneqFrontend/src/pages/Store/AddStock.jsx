import React, { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import usePurchase from "../../services/usePurchase";
import Button from "../../components/buttons/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/table/Table";
import SuccessModal from "../../components/common/SuccessModal";
import { BsFileEarmarkArrowUp } from "react-icons/bs";
import Badge from "../../components/common/Badge";

const AddStock = () => {
  const [selectedPO, setSelectedPO] = useState({ id: "", po_number: "" });
  const [selectedClass, setSelectedClass] = useState("");
  const [materialInputs, setMaterialInputs] = useState([]);
  const [tableItems, setTableItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const modalTimeoutRef = useRef(null);
  const queryClient = useQueryClient();

  const {
    getPendingPurchaseOrders,
    getPurchaseOrderItems,
    addStockToPurchaseOrder,
  } = usePurchase();

  const { data: purchases } = useQuery({
    queryKey: ["Purchases"],
    queryFn: getPendingPurchaseOrders,

  });

  const {
    data: itemData,
    refetch,
  } = useQuery({
    queryKey: ["Purchases", selectedPO.po_number, selectedClass],
    queryFn: () => getPurchaseOrderItems(selectedPO.po_number, selectedClass),
    enabled: !!selectedPO.po_number && !!selectedClass,
  });

  const { mutate: submitStock } = useMutation({
    mutationFn: (stockData) => addStockToPurchaseOrder(stockData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rawMaterials"] });
      queryClient.invalidateQueries({ queryKey: ["Purchases"] });
      queryClient.invalidateQueries({
        queryKey: ["POItems", selectedPO.po_number, selectedClass],
      });

      setTableItems([]);
      setSelectedPO({ id: "", po_number: "" });
      setSelectedClass("");
      toast.success("Stock Submitted Successfully")
    },
    onError: (err) => {
      console.error("Stock submission failed:", err);
      toast.error("Failed to submit stock. Please try again.");
    },
  });

  const handleQuantityChange = (id, qty) => {
    setMaterialInputs((prev) =>
      prev.map((m) => (m.item_id === id ? { ...m, recieved_quantity: qty } : m))
    );
  };

  const handleAddItem = () => {
    const valid = materialInputs
      .filter((i) => i.recieved_quantity > 0)
      .map((i) => ({
        item_id: i.item_id,
        _id: i._id,
        name: i.name,
        type: i.type,
        class_type: i.class_type,
        max_allowed: i.max_allowed,
        recieved_quantity: i.recieved_quantity,
      }));

    setTableItems((prev) => {
      const updated = [...prev];
      valid.forEach((newItem) => {
        const existingIndex = updated.findIndex(
          (item) => String(item.item_id) === String(newItem.item_id)
        );
        if (existingIndex !== -1) {
          const newQty =
            updated[existingIndex].recieved_quantity +
            newItem.recieved_quantity;
          if (newQty > newItem.max_allowed) {
            toast.error(
              `Total quantity for ${newItem.name} cannot exceed ${newItem.max_allowed}. Currently in table: ${updated[existingIndex].recieved_quantity}`
            );
            updated[existingIndex].recieved_quantity = newItem.max_allowed;
          } else {
            updated[existingIndex].recieved_quantity = newQty;
          }
        } else {
          updated.push(newItem);
        }
      });
      return updated;
    });
    setMaterialInputs([]);
  };

  const handleSubmit = () => {
    const payload = {
      po_id: selectedPO.id,
      items: tableItems.map((item) => ({
        item_id: item._id,
        recieved_quantity: item.recieved_quantity,
      })),
    };

    submitStock(payload);
  };

  useEffect(() => {
    if (itemData?.items?.length > 0) {
      const enriched = itemData.items.map((item) => ({
        ...item,
        recieved_quantity: 0,
      }));
      setMaterialInputs(enriched);
    }
  }, [itemData]);

  return (
    <div className="p-8 w-full px-6 mx-auto mt-10 rounded-2xl shadow border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Add Stock</h2>
        {/* <Button
          type="button"
          size="md"
          variant="primary"
          startIcon={<BsFileEarmarkArrowUp />}
          className="shadow-theme-xs px-3"
          disabled
        >
          Upload CSV
        </Button> */}
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select PO</label>
          <select
            className="w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800"
            value={JSON.stringify(selectedPO)}
            onChange={(e) => {
              const po = JSON.parse(e.target.value);
              setSelectedPO(po);
              setSelectedClass("");
              setTableItems([]);
            }}
          >
            <option value="">Select Purchase Order --</option>
            {purchases?.item?.map((po) => {
              const poNumber = po.data[0]?.replace("PRO-", "");
              return (
                <option
                  key={po.id}
                  value={JSON.stringify({ id: po.id, po_number: poNumber })}
                >
                  {po.data[0]} - {po.data[1]}
                </option>
              );
            })}
          </select>
        </div>

        {selectedPO.po_number && (
          <div>
            <label className="block text-sm font-medium mb-1 ">
              Select Class
            </label>
            <select
              className="w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-800"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">-- Select Class --</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        )}
      </div>

      {/* Materials Input */}
      {materialInputs.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Materials</h4>
          {materialInputs.map((item) => (
            <div>
              {item.class_type == selectedClass ? (
                <div key={item._id} className="flex items-center gap-4 mb-2">
                  <div className="w-1/4">
                    <span className="block text-sm font-medium text-text">
                      {item.name}
                      {(() => {
                        const existing = tableItems.find(
                          (t) => String(t.item_id) === String(item.item_id)
                        );
                        return existing
                          ? ` [${existing.recieved_quantity} in table]`
                          : "";
                      })()}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {item.type}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={(() => {
                      const existing = tableItems.find(
                        (t) => String(t.item_id) === String(item.item_id)
                      );
                      const inTable = existing
                        ? existing.recieved_quantity
                        : 0;
                      return Math.max(0, item.max_allowed - inTable);
                    })()}
                    value={item.recieved_quantity}
                    onChange={(e) => {
                      const existing = tableItems.find(
                        (t) => String(t.item_id) === String(item.item_id)
                      );
                      const inTable = existing
                        ? existing.recieved_quantity
                        : 0;
                      const maxAvailable = Math.max(
                        0,
                        item.max_allowed - inTable
                      );
                      let qty = Number(e.target.value);
                      if (qty > maxAvailable) {
                        toast.error(
                          `You can only add up to ${maxAvailable} more.`
                        );
                        qty = maxAvailable;
                      }
                      handleQuantityChange(item.item_id, qty);
                    }}
                    className="border px-3 py-1 rounded w-1/4"
                  />
                  <span className="text-xs text-gray-500">
                    Max:{" "}
                    {(() => {
                      const existing = tableItems.find(
                        (t) => String(t.item_id) === String(item.item_id)
                      );
                      const inTable = existing
                        ? existing.recieved_quantity
                        : 0;
                      return Math.max(0, item.max_allowed - inTable);
                    })()}
                  </span>
                </div>
              ) : (
                <></>
              )}
            </div>
          ))}
          <Button
            onClick={handleAddItem}
            className="mt-2"
            disabled={materialInputs.every((i) => i.recieved_quantity <= 0)}
          >
            Add Items to Table
          </Button>
        </div>
      )}

      {/* Table */}
      {tableItems.length > 0 && (
        <div className="mb-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-background">
                <TableCell isHeader className="text-left px-3 py-2">
                  Material
                </TableCell>
                <TableCell isHeader className="text-center px-3 py-2">
                  Class
                </TableCell>
                <TableCell isHeader className="text-center px-3 py-2">
                  Quantity
                </TableCell>
                <TableCell isHeader className="text-center px-3 py-2">
                  Max Allowed
                </TableCell>
                <TableCell isHeader className="text-center px-3 py-2">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody >
              {tableItems.map((row, idx) => (
                <TableRow
                  key={row.item_id || row._id || idx}
                  className={"bg-background"}
                >
                  <TableCell className="px-3 py-2">
                    <div>
                      <div className="font-medium text-sm">{row.name}</div>
                      <div className="text-xs text-gray-500">
                        {row.type || "—"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-3 py-2">
                    {row.class_type}
                  </TableCell>
                  <TableCell className="text-center px-3 py-2">
                    {row.recieved_quantity}
                  </TableCell>
                  <TableCell className="text-center px-3 py-2">
                    {row.max_allowed}
                  </TableCell>
                  <TableCell className="text-center px-3 py-2">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        setTableItems((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="px-2 py-1 text-xs"
                    >
                      <Badge color="error">
                        Delete
                      </Badge>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button variant="primary" className="mt-4" onClick={handleSubmit}>
            Submit Stock
          </Button>
        </div>
      )}

      <SuccessModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default AddStock;

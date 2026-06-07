import React from "react";
import { useParams } from "react-router-dom";
import usePurchase from "../../services/usePurchase";
import { useQuery } from "@tanstack/react-query";
import DaynamicTable from "../../components/common/Table"; // Ensure this import path is correct

const PurchaseDetails = () => {
  const { getPurchaseById } = usePurchase();
  const { id: purchase_id } = useParams();

  const {
    isLoading,
    data: purchase,
    error,
  } = useQuery({
    queryKey: ["purchaseId", purchase_id],
    queryFn: () => getPurchaseById(purchase_id),
  });

  if (isLoading) return <p>Loading purchase details...</p>;
  if (error) return <p className="text-red-500">Error fetching details.</p>;
  if (!purchase) return <p>No purchase data found.</p>;

  const tableData = {
    item: (purchase.items || []).map((item, idx) => ({
      id: `item-${idx + 1}`,
      data: [
        item.class || "-",
        item.name || "-",
        item.type || "-",
        item.quantity || "-",
        item.recieved_quantity || "-",
        Number(item.price_per_unit?.$numberDecimal || 0).toFixed(2),
        `₹${Number((item.quantity || 0) * (item.price_per_unit?.$numberDecimal || 0)).toFixed(2)}`
      ],
    })),
  };

  return (
    <div className="bg-background text-text m-4 shadow-lg border rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-4 text-primary">
        Purchase Order Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="font-semibold">PO Number:</p>
          <p>{purchase.po_number || "-"}</p>
        </div>
        <div>
          <p className="font-semibold">Vendor Name:</p>
          <p>{purchase.vendor_name || "-"}</p>
        </div>
        <div>
          <p className="font-semibold">Purchase Date:</p>
          <p>{new Date(purchase.purchasing_date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="font-semibold">Status:</p>
          <p className="capitalize">{purchase.status || "-"}</p>
        </div>
        <div>
          <p className="font-semibold">Total Price:</p>
          <p>₹ {Number(purchase.total_price?.$numberDecimal || 0).toFixed(2)}</p>
        </div>
        <div>
          <p className="font-semibold">Created At:</p>
          <p>{new Date(purchase.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3">Raw Material Items</h3>
        {tableData.item.length === 0 ? (
          <p className="text-text">No items found in this PO.</p>
        ) : (
          <DaynamicTable
            header={[
              "Class",
              "Raw Material Name",
              "Type",
              "Quantity",
              "Recieved",
              "Price/Unit",
              "Subtotal"
            ]}
            tableData={tableData}
          />
        )}
      </div>
    </div>
  );
};

export default PurchaseDetails;

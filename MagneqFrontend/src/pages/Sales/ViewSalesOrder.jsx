import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import useSalesOrders from "../../services/useSales";
import { selectAuth } from "../../features/authSlice";
import DaynamicTable from "../../components/common/Table";
import Button from "../../components/buttons/Button";
import Input from "../../components/forms/Input";
import OrderItemsForm from "../../components/sales/OrderItemsForm";
import { useNavigate } from "react-router-dom";

const formatStatus = (status) => {
  if (typeof status === "boolean") {
    return status ? (
      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Completed</span>
    ) : (
      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">Pending</span>
    );
  }
  
  if (typeof status === "string") {
    // Handle item statuses with color coding
    switch (status.toUpperCase()) {
      case "PENDING":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
            Pending
          </span>
        );
      case "INPROCESS":
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
            In Process
          </span>
        );
      case "PROCESSED":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
            Processed
          </span>
        );
      default:
        return status.replace(/_/g, " ");
    }
  }
  
  return status;
};

const ViewSalesOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editPrices, setEditPrices] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form states
  const [editItems, setEditItems] = useState([]);
  const [model, setModel] = useState("");
  const [type, setType] = useState("");
  const [ratio, setRatio] = useState("");
  const [quantity, setQuantity] = useState("");
  const [power, setPower] = useState("");

  const { getSaleById, approaveSale, rejectSale, updateSale, deleteSale } = useSalesOrders();
  const user = useSelector(selectAuth);
  const userRole = user?.route?.role;

  const { data, isLoading } = useQuery({
    queryKey: ["salesOrderById", id],
    queryFn: () => getSaleById(id),
  });



  useEffect(() => {
    if (data?.itemLevelData?.items) {
      const initializedItems = data.itemLevelData.items.map(item => ({
        ...item,
        rate_per_unit: Number(item.rate_per_unit || item.base_price || 0),
        fg_id: item.fg_id,
        invoiced_quantity: item.invoiced_quantity || 0,
      }));
      setEditPrices(initializedItems);

      // Initialize edit items for the form using the original data from backend
      const formItems = data.itemLevelData.items.map((item, index) => {
        return {
          id: item.fg_id || Date.now() + index,
          model: item.model || "", // Use the model data directly from backend
          power: item.power || "",
          ratio: item.ratio || "",
          type: item.type || "",
          quantity: item.quantity,
          invoiced_quantity: item.invoiced_quantity || 0,
          fg_id: item.fg_id,
          isExisting: true, // Mark as existing item
        };
      });
      setEditItems(formItems);
    }
  }, [data]);

  if (isLoading) return <p>Loading sales order details...</p>;
  if (!data) return <p>No sales order found.</p>;

  const status = data.headerLevelData?.Status;
  const isUnapproved = status === "UN_APPROVED";
  const canApprove = (["SALES", "ADMIN"].includes(userRole?.toUpperCase())) && isUnapproved;
  const canEdit = isUnapproved || (userRole?.toUpperCase() === "ADMIN" && status !== "UN_APPROVED"); // Can edit if unapproved OR admin editing approved orders

  const headerData = data.headerLevelData || {};
  const itemLevel = data.itemLevelData || {};

  const headerTable = {
    header: Object.keys(headerData),
    item: [{
      id: headerData["Order Id"] || "order-id",
      data: Object.entries(headerData).map(([key, val]) => {
        if (key === "Date of Creation") return new Date(val).toLocaleDateString();
        if (key === "Status") return formatStatus(val);
        if (Array.isArray(val)) return val.join(", ");
        if (["Sub Total", "Total Tax Amount", "Total with Tax", "Total Price", "Recieved Amount"].includes(key)) {
          return Number(val).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
          });
        }
        return val;
      }),
    }],
  };

  const itemTable = {
    header: itemLevel.header || [],
    item: (itemLevel.items || []).map((row, idx) => ({
      id: idx,
      data: [
        row.quantity,
        row.invoiced_quantity || 0,
        row.finished_good,
        Number(row.rate_per_unit).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
        }),
        Number(row.item_total_price).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
        }),
        row.tax_details ? (
          <div className="text-sm">
            {row.tax_details.map((tax, taxIdx) => (
              <div key={taxIdx} className="flex justify-between">
                <span>{tax.type} ({tax.percentage}%):</span>
                <span>{Number(tax.amount).toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 2,
                })}</span>
              </div>
            ))}
          </div>
        ) : "N/A",
        Number(row.total_with_tax).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 2,
        }),
        formatStatus(row.status),
      ],
    })),
  };

  const approvalTable = {
    header: itemLevel.header || [],
    item: (editPrices || []).map((row, idx) => {
      const calculatedAmount = row.quantity * (row.rate_per_unit || row.base_price);
      return {
        id: idx,
        data: [
          row.quantity,
          row.invoiced_quantity || 0,
          row.finished_good,
          <Input
            type="number"
            min={row.base_price}
            className="w-24"
            value={row.rate_per_unit}
            placeholder={"Base Price is " + Number(row.base_price).toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              minimumFractionDigits: 2,
            })}
            onChange={(e) => {
              setEditPrices(prices =>
                prices.map((r, i) =>
                  i === idx ? { ...r, rate_per_unit: e.target.value } : r
                )
              )
            }
            }
          />,
          Number(calculatedAmount).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
          }),
          "Tax calculation will be shown after approval",
          "Tax calculation will be shown after approval",
          formatStatus(row.status),
        ],
      };
    }),
  };

  const handleApprove = async () => {
    setIsApproving(true);
    const hasZero = editPrices?.some(item => !item.rate_per_unit || Number(item.rate_per_unit) === 0 || Number(item.rate_per_unit) < item.base_price);
    if (hasZero) {
      toast.error("All items must have a non-zero price greater should be above the base price before approval.");
      setIsApproving(false);
      return;
    }
    try {
      const updatedItems = editPrices.map(item => ({
        fg_id: item.fg_id,
        rate_per_unit: Number(item.rate_per_unit),
        quantity: item.quantity,
        item_total_price: Number(item.rate_per_unit) * Number(item.quantity),
      }));
      await approaveSale(id, { finished_goods: updatedItems });
      await queryClient.invalidateQueries(["salesOrderById", id]);
      toast.success("Sales order approved successfully!");
    } catch (error) {
      console.error("Approval failed:", error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || "Approval failed";
      toast.error(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsApproving(true);
    try {
      await rejectSale(id);
      await queryClient.invalidateQueries(["salesOrderById", id]);
      toast.success("Sales order rejected successfully!");
    } catch (error) {
      console.error("Rejection failed:", error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || "Rejection failed";
      toast.error(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };


  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset edit items to original data
    if (data?.itemLevelData?.items) {
      const formItems = data.itemLevelData.items.map((item, index) => {
        return {
          id: item.fg_id || Date.now() + index,
          model: item.model || "",
          power: item.power || "",
          ratio: item.ratio || "",
          type: item.type || "",
          quantity: item.quantity,
          fg_id: item.fg_id,
          isExisting: true,
        };
      });
      setEditItems(formItems);
    }
  };

  const handleSaveEdit = async () => {
    if (!editItems.length) {
      toast.error("Please add at least one item before saving.");
      return;
    }

    // Debug logging
    console.log("Frontend Debug - User Role:", {
      userRole,
      userRoleType: typeof userRole,
      userRoleUpper: userRole?.toUpperCase(),
      user,
      canEdit,
      status,
      isAdmin: userRole?.toUpperCase() === "ADMIN",
      isUnapproved: status === "UN_APPROVED"
    });

    setIsSaving(true);
    try {
      const updateData = {
        finished_goods: editItems.map(item => ({
          model: item.model,
          type: item.type,
          ratio: item.ratio,
          power: item.power,
          quantity: item.quantity,
          rate_per_unit: 0, // Will be set to base price on backend
          // Include fg_id only for existing items to handle updates properly
          ...(item.isExisting && item.fg_id ? { fg_id: item.fg_id } : {})
        }))
      };

      await updateSale(id, updateData);
      await queryClient.invalidateQueries(["salesOrderById", id]);
      toast.success("Sales order updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || "Failed to update sales order";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!window.confirm("Are you sure you want to delete this sales order? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteSale(id);
      toast.success("Sales order deleted successfully!");
      navigate("/sales");
    } catch (error) {
      console.error("Delete failed:", error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || "Failed to delete sales order";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full overflow-x-auto grid gap-4 md:gap-6 bg-background text-text p-6">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-2xl">Sales Order Details</h2>
        <div className="flex gap-2">
          {canEdit && !isEditing && (
            <Button onClick={handleEdit} variant="primary">
              Edit Order
            </Button>
          )}
          {userRole?.toUpperCase() === "ADMIN" && (
            <Button onClick={handleDeleteOrder} variant="danger">
              Delete Order
            </Button>
          )}
        </div>
      </div>

      <DaynamicTable header={headerTable.header} tableData={headerTable} />

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Order Items</h3>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Edit Instructions:</h4>
              <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                {userRole?.toUpperCase() === "ADMIN" && status !== "UN_APPROVED" ? (
                  <>
                    <li>As an admin, you can edit approved sales orders</li>
                    <li>Cannot remove items that have been invoiced</li>
                    <li>Cannot reduce quantity below invoiced amount</li>
                    <li>Can increase quantities or add new items</li>
                    <li>Cannot add duplicate items - increase existing quantity instead</li>
                  </>
                ) : (
                  <>
                    <li>Use the "Delete" button to remove existing items</li>
                    <li>Use the form below to add new items</li>
                    <li>Existing items will be updated, new items will be added</li>
                  </>
                )}
              </ul>
            </div>
            <OrderItemsForm
              items={editItems}
              setItems={setEditItems}
              model={model}
              setModel={setModel}
              type={type}
              setType={setType}
              ratio={ratio}
              setRatio={setRatio}
              quantity={quantity}
              setQuantity={setQuantity}
              power={power}
              setPower={setPower}
              isAdminEditingApproved={userRole?.toUpperCase() === "ADMIN" && status !== "UN_APPROVED"}
            />
            <div className="flex gap-4 mt-4">
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </div>
        ) : canApprove ? (
          <>
            <DaynamicTable header={approvalTable.header} tableData={approvalTable} />
            <div className="flex gap-4 mt-4">
              <Button onClick={handleApprove} disabled={isApproving}>
                {isApproving ? "Approving..." : "Approve"}
              </Button>
              <Button onClick={handleReject} variant="danger" disabled={isApproving}>
                {isApproving ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          </>
        ) : (
          <DaynamicTable header={itemTable.header} tableData={itemTable} />
        )}
      </div>
    </div>
  );
};

export default ViewSalesOrder;
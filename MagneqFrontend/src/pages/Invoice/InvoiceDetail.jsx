import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useInvoice from "../../services/useInvoice";
import Button from "../../components/buttons/Button";
import Badge from "../../components/common/Badge";
import Input from "../../components/forms/Input";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { selectAuth } from "../../features/authSlice";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInvoiceDetails, updateTransportDetails, downloadInvoicePDF } = useInvoice();
  const queryClient = useQueryClient();
  const auth = useSelector(selectAuth);
  const isCustomer = auth?.route?.role === "CUSTOMER";

  const [isEditingTransport, setIsEditingTransport] = useState(false);
  const [transportForm, setTransportForm] = useState({
    transport_details: "",
    lr_number: "",
  });

  const handleDownloadInvoice = async () => {
    try {
      const response = await downloadInvoicePDF(id);

      // Create blob URL and trigger download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoiceData.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || "Failed to download invoice";
      toast.error(errorMessage);
    }
  };

  const {
    data: invoiceData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["invoiceDetail", id],
    queryFn: () => getInvoiceDetails(id),
    enabled: !!id,
  });

  // Update forms when invoice data loads
  React.useEffect(() => {
    if (invoiceData) {
      setTransportForm({
        transport_details: invoiceData.transport_details || "",
        lr_number: invoiceData.lr_number || "",
      });
    }
  }, [invoiceData]);

  const updateTransportMutation = useMutation({
    mutationFn: (data) => updateTransportDetails(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["invoiceDetail", id]);
      toast.success("Transport details updated successfully");
      setIsEditingTransport(false);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || "Failed to update transport details";
      toast.error(errorMessage);
      console.error("Error updating transport details:", error);
    },
  });



  const handleTransportSubmit = () => {
    updateTransportMutation.mutate(transportForm);
  };

  const handleTransportCancel = () => {
    setTransportForm({
      transport_details: invoiceData?.transport_details || "",
      lr_number: invoiceData?.lr_number || "",
    });
    setIsEditingTransport(false);
  };



  const getStatusColor = (status) => {
    switch (status) {
      case "UNPROCESSED":
        return "warning";
      case "PROCESSED":
        return "success";
      default:
        return "primary";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "UNPROCESSED":
        return "Unprocessed";
      case "PROCESSED":
        return "Processed";
      default:
        return status;
    }
  };

  if (isLoading) {
    return <p className="text-lg">Loading invoice...</p>;
  }

  if (isError) {
    return (
      <div>
        <p className="text-red-500 text-lg mb-4">
          Error: {error?.message || "Failed to load invoice details"}
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div>
        <p className="text-gray-500 text-lg mb-4">Invoice not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="bg-background text-text">
      {/* Header */}
      <div className="flex justify-between items-center pt-5 mb-6">
        <div>
          <h2 className="font-semibold text-text text-2xl">
            Invoice #{invoiceData.invoice_number}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sales Order: {invoiceData.sales_order?.sales_order_number}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadInvoice} variant="primary">
            ⬇ Download Invoice
          </Button>
          {/* {isAdmin && (
            <Button 
              onClick={handleDeleteInvoice} 
              variant="danger"
              disabled={deleteInvoiceMutation.isLoading}
            >
              {deleteInvoiceMutation.isLoading ? "Deleting..." : "🗑️ Delete"}
            </Button>
          )} */}
          <Button onClick={() => navigate(-1)} variant="outline">
            ← Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        {/* Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">
              Invoice Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-text">
                  Status:
                </span>
                <Badge
                  color={getStatusColor(invoiceData.status)}
                  size="sm"
                >
                  {getStatusLabel(invoiceData.status)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Invoice Date:
                </span>
                <span className="text-text">{invoiceData.invoice_date}</span>
              </div>
              {invoiceData.due_date && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Due Date:
                  </span>
                  <span className="text-text">{invoiceData.due_date}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text mb-4">
              Customer Details
            </h3>
            <div className="space-y-2">
              <p className="font-medium">{invoiceData.customer?.name}</p>
              <p>{invoiceData.customer?.address}</p>
              <p>{invoiceData.customer?.state}</p>
              {invoiceData.customer?.pincode && (
                <p>Pin: {invoiceData.customer?.pincode}</p>
              )}
              {invoiceData.customer?.email && (
                <p>Email: {invoiceData.customer?.email}</p>
              )}
              {invoiceData.customer?.phone && (
                <p>Phone: {invoiceData.customer?.phone}</p>
              )}
              {invoiceData.customer?.gst && (
                <p>GSTIN: {invoiceData.customer?.gst}</p>
              )}
            </div>
          </div>
        </div>

        {/* Transport Details */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text">
              Transport Details
            </h3>
            {!isEditingTransport && !isCustomer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingTransport(true)}
              >
                Edit Transport Details
              </Button>
            )}
          </div>

          {isEditingTransport ? (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LR Number
                  </label>
                  <Input
                    value={transportForm.lr_number}
                    onChange={(e) =>
                      setTransportForm((prev) => ({
                        ...prev,
                        lr_number: e.target.value,
                      }))
                    }
                    placeholder="Enter LR Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transport Details
                  </label>
                  <Input
                    value={transportForm.transport_details}
                    onChange={(e) =>
                      setTransportForm((prev) => ({
                        ...prev,
                        transport_details: e.target.value,
                      }))
                    }
                    placeholder="Enter Transport Details"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleTransportSubmit}
                  disabled={updateTransportMutation.isLoading}
                  variant="primary"
                  size="sm"
                >
                  {updateTransportMutation.isLoading ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={handleTransportCancel}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    LR Number:
                  </span>
                  <p className="text-text">
                    {invoiceData?.lr_number || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Transport Details:
                  </span>
                  <p className="text-text">
                    {invoiceData?.transport_details || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text mb-4">Invoice Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-border rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2">Model</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Ratio</th>
                  <th className="px-4 py-2">Power</th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Rate</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Taxes</th>
                  <th className="px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-border hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2">{item.finished_good?.model}</td>
                    <td className="px-4 py-2">{item.finished_good?.type}</td>
                    <td className="px-4 py-2">{item.finished_good?.ratio}</td>
                    <td className="px-4 py-2">{item.finished_good?.power}</td>
                    <td className="px-4 py-2">{item.invoiced_quantity}</td>
                    <td className="px-4 py-2">₹{item.rate_per_unit}</td>
                    <td className="px-4 py-2">₹{item.invoiced_amount}</td>
                    <td className="px-4 py-2">
                      {item.taxes.map((t, i) => (
                        <div key={i}>
                          {t.type} {t.percentage}% : ₹{t.amount}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-2">₹{item.total_with_tax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <div className="text-right space-y-2">
            <h3 className="text-xl font-semibold text-text">
              Total Amount: ₹{invoiceData.total_invoice_amount}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Generated on: {invoiceData.createdAt}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceDetail;

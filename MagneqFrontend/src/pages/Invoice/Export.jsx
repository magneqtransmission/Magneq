import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/buttons/Button";
import { HiOutlineDocumentDownload, HiOutlineArrowLeft } from "react-icons/hi";
import { toast } from "react-hot-toast";
import useExport from "../../services/useExport";
import { useNavigate } from "react-router-dom";
import OrderNameInput from "../../components/sales/OrderInputName";
import { selectAuth } from "../../features/authSlice";
import DatePicker from "react-datepicker"; // ✅ added

const Export = () => {
  const navigate = useNavigate();
  const auth = useSelector(selectAuth);
  const user = auth?.user;
  const role = user?.role || "ADMIN";
  const userId = user?._id;

  const [customer, setCustomer] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [repName, setRepName] = useState("");
  const [exportType, setExportType] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const { exportData } = useExport();

  useEffect(() => {
    if (role === "CUSTOMER" && userId) {
      const customerInfo = {
        id: userId,
        name: user?.name || user?.user_name || "Customer",
        data: [
          user?.name || user?.user_name || "Customer",
          user?.address || "",
          user?.gst_number || "",
        ],
      };
      setCustomer(customerInfo);
      setCustomerName(customerInfo);
    }
  }, [role, userId, user]);

  const handleExport = async () => {
    if (!customer || !exportType) {
      toast.error("Please select both customer and export type");
      return;
    }

    if (!fromDate || !toDate) {
      toast.error("Please select a valid date range");
      return;
    }

    try {
      toast.loading("Generating export...", { id: "export-loading" });

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const startDate = formatDate(fromDate);
      const endDate = formatDate(toDate);

      await exportData(customer.id, exportType, startDate, endDate);

      toast.success(`${exportType} exported successfully`, {
        id: "export-loading",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        error.response?.data?.message || "Failed to export data",
        { id: "export-loading" }
      );
    }
  };


  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-background text-text">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📤 Export Data</h1>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/invoice")}
            variant="outlined"
            startIcon={<HiOutlineArrowLeft />}
          >
            Back to Invoice
          </Button>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-background shadow-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-4">
        {/* Customer Selection */}
        {role !== "CUSTOMER" ? (
          <OrderNameInput
            repName={repName}
            setRepName={setRepName}
            customerName={customerName}
            setCustomerName={setCustomerName}
            setCustomer={setCustomer}
          />
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Customer Name
              </label>
              <div className="w-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg px-3 py-2 text-sm">
                {user?.name || user?.user_name || "Customer"}
              </div>
            </div>
          </div>
        )}

        {/* Export Type Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Export Type
          </label>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 bg-background text-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select export type</option>
            <option value="invoices">Invoices</option>
            <option value="ledger">Ledger</option>
            <option value="payments">Payment Received</option>
          </select>
        </div>

        {/* Date Range Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full border border-gray-300 dark:border-gray-600 bg-background text-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select start date"
              maxDate={toDate || new Date()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full border border-gray-300 dark:border-gray-600 bg-background text-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select end date"
              minDate={fromDate}
              maxDate={new Date()}
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          size="md"
          startIcon={<HiOutlineDocumentDownload />}
          onClick={handleExport}
        >
          Export
        </Button>
      </div>
    </div>
  );
};

export default Export;

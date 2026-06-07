// src/pages/Ledger.jsx
import React, {useState, useEffect, useRef} from "react";
import {useSelector} from "react-redux";
import OrderNameInput from "../../components/sales/OrderInputName";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {useQuery} from "@tanstack/react-query";
import {toast} from "react-hot-toast";
import useLedger from "../../services/useLedger";
import LedgerDownload from "./Ledger";
import {selectAuth} from "../../features/authSlice";
import { APIS } from "../../api/apiUrls";
import Button from "../../components/buttons/Button";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi";

const Ledger = () => {
  const auth = useSelector(selectAuth);
  const navigate = useNavigate();
  const user = auth?.user;
  const role = user?.role || "ADMIN";
  const userId = user?._id;

  const [customer, setCustomer] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [repName, setRepName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const {getLedger} = useLedger();
  const ledgerRef = useRef();

  // Auto-set customer for CUSTOMER role users
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

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      toast.error("Start date cannot be later than end date");
    }
  }, [startDate, endDate]);

  const {
    data: ledgerData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "ledger",
      customer?.id,
      startDate?.toISOString(),
      endDate?.toISOString(),
    ],
    queryFn: async () => {
      if (!customer || !startDate || !endDate) return null;
      if (startDate > endDate) return null;
      return await getLedger({
        customerId: customer.id,
        startDate,
        endDate,
      });
    },
    enabled: !!customer && !!startDate && !!endDate,
    keepPreviousData: true,
  });

  const handleDownloadLedger = async () => {
    if (!customer || !startDate || !endDate) return;
  
    const query = new URLSearchParams({
      customerId: customer.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  
    try {
      const res = await fetch(`${APIS.ledger}/pdf?${query.toString()}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
  
      if (!res.ok) throw new Error("Failed to download ledger");
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      a.download = `Ledger_${customer.name}_${startDate.toLocaleDateString()}_to_${endDate.toLocaleDateString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
  
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download ledger");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 bg-background text-text">
      {/* Header */}
      <div className="flex">
        <h1 className="text-2xl font-bold flex-1">📒 Ledger</h1>
        {/* Actions */}
        <div>
        {ledgerData && (
          <button
            onClick={handleDownloadLedger}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Download Ledger
          </button>
        )}
        <Button onClick={()=>navigate("/invoice")} variant="outlined" startIcon={<HiOutlineArrowLeft />}>Back to Invoice</Button>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-background shadow-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-4">
        {role !== "CUSTOMER" && (
          <OrderNameInput
            repName={repName}
            setRepName={setRepName}
            customerName={customerName}
            setCustomerName={setCustomerName}
            setCustomer={setCustomer}
          />
        )}
        {role === "CUSTOMER" && (
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

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd-MM-yyyy"
              className="w-full border border-gray-300 dark:border-gray-600 bg-background text-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select start date"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              className="w-full border border-gray-300 dark:border-gray-600 bg-background text-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select end date"
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-background shadow-md rounded-xl border border-gray-200 dark:border-gray-700">
        {isLoading || isFetching ? (
          <div className="p-6 text-center">Loading ledger...</div>
        ) : ledgerData && ledgerData.ledgerEntries.length > 0 ? (
          <div className="p-4">
            <div
              className="overflow-x-auto overflow-y-auto border rounded-lg"
              style={{maxHeight: "70vh"}}
            >
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 text-text sticky top-0">
                    <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">
                      Date
                    </th>
                    <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">
                      Particulars
                    </th>
                    <th className="border border-gray-200 dark:border-gray-700 p-2 text-right">
                      Debit (₹)
                    </th>
                    <th className="border border-gray-200 dark:border-gray-700 p-2 text-right">
                      Credit (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData.ledgerEntries.map((entry, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        idx === 0
                          ? "font-semibold bg-gray-50 dark:bg-gray-800" // Opening
                          : entry.particulars === "Closing Balance"
                          ? "font-semibold bg-gray-100 dark:bg-gray-900" // Closing
                          : "even:bg-gray-50 dark:even:bg-gray-900/40"
                      }`}
                    >
                      <td className="border border-gray-200 dark:border-gray-700 p-2">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-2">
                        {entry.particulars}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-2 text-right text-red-600 dark:text-red-400">
                        {entry.debit ? entry.debit.toLocaleString() : "-"}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 p-2 text-right text-green-600 dark:text-green-400">
                        {entry.credit ? entry.credit.toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No ledger data found for this range.
          </div>
        )}
      </div>

      {/* Hidden PDF Render Section */}
      <div className="hidden">
        <LedgerDownload
          ref={ledgerRef}
          ledgerData={ledgerData}
          customerData={customer}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
};

export default Ledger;

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import usePayment from "../../services/usePayment";
import Button from "../../components/buttons/Button";
import OrderNameInput from "../../components/sales/OrderInputName";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaMoneyBillWave,
  FaStickyNote,
  FaCreditCard,
  FaReceipt,
} from "react-icons/fa";
import { HiOutlineArrowLeft } from "react-icons/hi";

const AddPayment = () => {
  const [customer, setCustomer] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { createPayment } = usePayment();

  const transactionTypes = [
    { value: "NEFT", label: "NEFT" },
    { value: "RTGS", label: "RTGS" },
    { value: "CHEQUE", label: "CHEQUE" },
    { value: "UPI", label: "UPI" },
  ];

  const { mutate } = useMutation({
    mutationFn: (payload) => createPayment(payload),
    onSuccess: () => {
      toast.success("Payment recorded successfully!");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setCustomer(null);
      setAmount("");
      setNote("");
      setTransactionType("");
      setTransactionId("");
      navigate("/invoice");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to record payment");
    },
  });

  const handleSubmit = () => {
    if (!customer?.id || !amount) {
      toast.error("Customer and amount are required");
      return;
    }

    if (!transactionType || !transactionId) {
      toast.error("Transaction type and transaction ID are required");
      return;
    }

    mutate({
      customerId: customer.id,
      date_of_recieval: new Date(),
      amount,
      description: note,
      transactionType,
      transactionId,
    });
  };

  return (
    <div className="p-6 rounded-2xl shadow-lg border w-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FaMoneyBillWave className="text-green-600" /> Add Payment
        </h2>
        <Button
          onClick={() => navigate("/invoice")}
          variant="outlined"
          startIcon={<HiOutlineArrowLeft />}
        >
          Back to Invoice
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer */}
        <div>
          <OrderNameInput
            customerName={customer}
            setCustomerName={setCustomer}
            setCustomer={setCustomer}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <FaMoneyBillWave className="text-gray-500" /> Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Enter amount"
          />
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <FaCreditCard className="text-gray-500" /> Transaction Type
          </label>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="">Select Transaction Type</option>
            {transactionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Transaction ID */}
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <FaReceipt className="text-gray-500" /> Transaction ID
          </label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder={`Enter ${transactionType || "Transaction"} ID`}
          />
        </div>

        {/* Note (full width) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <FaStickyNote className="text-gray-500" /> Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8">
        <Button
          variant="primary"
          className="w-full py-3 rounded-lg text-lg flex items-center justify-center gap-2"
          onClick={handleSubmit}
        >
          <FaMoneyBillWave /> Save Payment
        </Button>
      </div>
    </div>
  );
};

export default AddPayment;

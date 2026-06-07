import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { State } from "country-state-city";
import Button from "../../components/buttons/Button";
import SuccessModal from "../../components/common/SuccessModal";
import OrderNameInput from "../../components/sales/OrderInputName";
import useInvoice from "../../services/useInvoice";
import useDelivery from "../../services/useDelivery";
import { useNavigate } from "react-router-dom";

const AddDelivery = () => {
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [repName, setRepName] = useState("");
  const [customer, setCustomer] = useState({});
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const navigate = useNavigate();

  // from / to
  const [fromState, setFromState] = useState("");
  const [fromPin, setFromPin] = useState("");
  const [toState, setToState] = useState("");
  const [toPin, setToPin] = useState("");

  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { getInvoicesOfCustomer } = useInvoice();
  const { generateDelivery } = useDelivery();

  const { data: invoices = [], isLoading: invoiceLoading } = useQuery({
    queryKey: ["CustomerInvoices", customer.id],
    queryFn: () => getInvoicesOfCustomer(customer.id),
    enabled: !!customer.id,
  });

  const { mutate: createDelivery } = useMutation({
    mutationFn: generateDelivery,
    onSuccess: () => {
      toast.success("Delivery created successfully!");
      queryClient.invalidateQueries({queryKey:["AllDeliveries"]})
      resetForm();
      navigate("/delivery")
    },
    onError: () => toast.error("Failed to create delivery"),
  });

  const resetForm = () => {
    setSelectedInvoices([]);
    setCustomer({});
    setCustomerId("");
    setCustomerName("");
    setRepName("");
    setFromState("");
    setFromPin("");
    setToState("");
    setToPin("");
    setDescription("");
  };

  const handleCustomerSelect = (customerData) => {
    if (customerData && customerData.id && customerData.name) {
      setCustomer(customerData);
      setCustomerName(customerData.name);
      setCustomerId(customerData.id);
    }
  };

  const toggleInvoiceSelection = (invoiceId) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };


  const handleSubmit = () => {
    if (selectedInvoices.length === 0) {
      toast.error("Please select at least one invoice");
      return;
    }
    if (!fromState || !fromPin || !toState || !toPin) {
      toast.error("Please fill in both From and To details");
      return;
    }
    if (!/^\d{6}$/.test(fromPin) || !/^\d{6}$/.test(toPin)) {
      toast.error("Please enter valid 6-digit pin codes");
      return;
    }

    const payload = {
      invoices: selectedInvoices,
      from: { state: fromState, pin_code: fromPin },
      to: { state: toState, pin_code: toPin },
      description,
    };

    createDelivery(payload);
  };

  // Get all states of India
  const indianStates = State.getStatesOfCountry("IN");

  return (
    <div className="p-8 w-full px-6 mx-auto mt-10 rounded-2xl shadow border">
      <h2 className="text-2xl font-semibold mb-6">Create Delivery</h2>

      {/* Customer */}
      <OrderNameInput
        repName={repName}
        setRepName={setRepName}
        customerName={customerName}
        setCustomerName={handleCustomerSelect}
        setCustomer={setCustomer}
      />

      {/* Invoices */}
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Select Invoices</h4>
        {invoiceLoading ? (
          <p>Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p>No invoices found</p>
        ) : (
          <ul className="space-y-2">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={inv.id}
                  checked={selectedInvoices.includes(inv.id)}
                  onChange={() => toggleInvoiceSelection(inv.id)}
                />
                <span>
                  Invoice #{inv.invoice_number} | Sales #{inv.salesOrderNumber} |{" "}
                  {new Date(inv.invoice_date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* From / To */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div>
          <h4 className="font-semibold mb-2">From</h4>
          <select
            value={fromState}
            onChange={(e) => setFromState(e.target.value)}
            className="border rounded px-3 py-2 w-full mb-2  bg-white dark:bg-gray-900"
          >
            <option value="">Select State</option>
            {indianStates.map((st) => (
              <option key={st.isoCode} value={st.name}>
                {st.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Pin Code"
            value={fromPin}
            onChange={(e) => setFromPin(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <h4 className="font-semibold mb-2">To</h4>
          <select
            value={toState}
            onChange={(e) => setToState(e.target.value)}
            className="border rounded px-3 py-2 w-full mb-2 bg-white dark:bg-gray-900"
          >
            <option value="">Select State</option>
            {indianStates.map((st) => (
              <option key={st.isoCode} value={st.name}>
                {st.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Pin Code"
            value={toPin}
            onChange={(e) => setToPin(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mt-6">
        <h4 className="font-semibold mb-2">Description</h4>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add delivery notes..."
          className="border rounded px-3 py-2 w-full"
          rows="3"
        />
      </div>

      {/* Submit */}
      <div className="mt-6">
        <Button onClick={handleSubmit}>Create Delivery</Button>
      </div>

      <SuccessModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default AddDelivery;

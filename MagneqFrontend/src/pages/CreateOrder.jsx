import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import OrderNameInput from "../components/sales/OrderInputName";
import OrderItemsForm from "../components/sales/OrderItemsForm";
import Button from "../components/buttons/Button";
import useSales from "../services/useSales";
import { useNavigate } from "react-router-dom";
import { selectAuth } from "../features/authSlice";

const CreateOrder = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const auth = useSelector(selectAuth);
  const role = user?.role || "ADMIN";
  const { createSale } = useSales();
  const queryClient = useQueryClient();
  const [repName, setRepName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([]);
  const [model, setModel] = useState("");
  const [type, setType] = useState("");
  const [ratio, setRatio] = useState("");
  const [quantity, setQuantity] = useState("");
  const [power, setPower] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedItem, setEditedItem] = useState({});

  const {
    mutate: createOrder,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: (orderPayload) => createSale(orderPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard/customer/top"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard/top"] });
      toast.success("Order submitted successfully!");
      resetForm();
      if (role == "SALES" || role == "CUSTOMER") {
        navigate("/track_order");
      } else if (role == "ADMIN") {
        navigate("/sales");
      } else {
        navigate("/track_order");
      }
    },
    onError: (err) => {
      console.error("Order creation failed:", err);
      toast.error("Failed to create order. Please try again.");
    },
  });

  const resetForm = () => {
    setRepName("");
    setCustomerName("");
    setItems([]);
  };
  const [customer, setCustomer] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Please add at least one item before submitting.");
      return;
    }

    const payload = {
      customer_name: role !== "CUSTOMER" ? customer.name : (user?.name || "CUSTOMER"),
      magneq_user: role !== "CUSTOMER" ? (repName || user?.name || "") : (user?.name || "CUSTOMER"),
      description,
      created_for: role !== "CUSTOMER" ? customer.id : auth?.user?._id,
      delivery_date: new Date().toISOString().split("T")[0],
      created_by: user?._id || null,
      finished_goods: items.map((item) => ({
        model: item.model,
        type: item.type,
        ratio: item.ratio,
        power: item.power,
        quantity: item.quantity,
      })),
    };

    createOrder(payload);
  };

  return (
    <div className="grid gap-4 md:gap-6 bg-background text-text p-15 md:p-15 rounded-lg shadow-sm">
      <h1 className="text-3xl font-semibold text-text">Create Order</h1>

      {role !== "CUSTOMER" ? (
        <OrderNameInput
          repName={repName}
          setRepName={setRepName}
          customerName={customerName}
          setCustomerName={setCustomerName}
          setCustomer={setCustomer}
        />
      ) : (
        <></>
      )}

      <form onSubmit={handleSubmit}>
        <OrderItemsForm
          items={items}
          setItems={setItems}
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
          editingId={editingId}
          setEditingId={setEditingId}
          editedItem={editedItem}
          setEditedItem={setEditedItem}
        />
        <div className="mt-4">
          <label className="block mb-1 font-medium">Order Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded bg-background text-text"
            placeholder="Enter any additional order details..."
            rows={3}
          />
        </div>

        <div className="mt-6">
          <Button
            type="submit"
            size="xl"
            variant="primary"
            className="p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={items.length === 0 || isPending}
          >
            {isPending ? "Submitting..." : "Submit Order"}
          </Button>
        </div>
      </form>

      {isError && (
        <p className="text-red-600 mt-4">
          Error: {error?.response?.data?.message || error.message}
        </p>
      )}
      {isSuccess && (
        <p className="text-green-600 mt-4">Order submitted successfully!</p>
      )}
    </div>
  );
};

export default CreateOrder;

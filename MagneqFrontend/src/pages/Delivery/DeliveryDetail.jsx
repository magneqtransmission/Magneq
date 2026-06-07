import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/buttons/Button";
import useDelivery from "../../services/useDelivery";
import { toast } from "react-hot-toast";

const DeliveryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDeliveryDetails, updateDelivery } = useDelivery();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    lr_number: "",
    transport_details: "",
    description: "",
  });

  const {
    data: deliveryData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["deliveryDetail", id],
    queryFn: () => getDeliveryDetails(id),
    enabled: !!id,
    onSuccess: (data) => {
      setFormData({
        lr_number: data.lr_number || "",
        transport_details: data.transport_details || "",
        description: data.description || "",
      });
    },
  });

  const mutation = useMutation({
    mutationFn: (body) => updateDelivery(id, body),
    onSuccess: () => {
      toast.success("Delivery updated successfully");
      queryClient.invalidateQueries(["deliveryDetail", id]);
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update delivery");
    },
  });

  if (isLoading) return <p className="text-lg">Loading delivery...</p>;
  if (isError)
    return (
      <div>
        <p className="text-red-500 text-lg mb-4">
          Error: {error?.message || "Failed to load delivery details"}
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  if (!deliveryData)
    return (
      <div>
        <p className="text-text text-lg mb-4">Delivery not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="bg-background text-text">
      {/* Header */}
      <div className="flex justify-between items-center pt-5 mb-6">
        <div>
          <h2 className="font-semibold text-text text-2xl">
            Delivery #{deliveryData._id.slice(-6).toUpperCase()}
          </h2>
          <p className="text-text mt-1">
            Dispatched At:{" "}
            {new Date(deliveryData.dispatched_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          {/* <Button onClick={() => window.print()} variant="primary">
            ⬇ Download Delivery Note
          </Button> */}
          <Button onClick={() => navigate(-1)} variant="outline">
            ← Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        {/* Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Editable Delivery Info */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">
              Delivery Information
            </h3>

            {!isEditing ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-text">
                    LR Number:
                  </span>
                  <span className="text-text border-border">
                    {deliveryData.lr_number || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-text">
                    Transport Details:
                  </span>
                  <span className="text-text">
                    {deliveryData.transport_details || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-text">
                    Description:
                  </span>
                  <span className="text-text">
                    {deliveryData.description || "-"}
                  </span>
                </div>
                <Button onClick={() => setIsEditing(true)} variant="primary">
                  ✏ Edit
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">LR Number</label>
                  <input
                    type="text"
                    name="lr_number"
                    value={formData.lr_number}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded-lg px-3 py-2 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Transport Details
                  </label>
                  <input
                    type="text"
                    name="transport_details"
                    value={formData.transport_details}
                    onChange={handleChange}
                    className="w-full border border-gray-400 rounded-lg px-3 py-2 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-gray-400 rounded-lg px-3 py-2 bg-background"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={mutation.isLoading}>
                    {mutation.isLoading ? "Updating..." : "💾 Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Route Info */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4">
              Route Information
            </h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">From: </span>
                {deliveryData.from.state}, Pin: {deliveryData.from.pin_code}
              </p>
              <p>
                <span className="font-medium">To: </span>
                {deliveryData.to.state}, Pin: {deliveryData.to.pin_code}
              </p>
            </div>
          </div>
        </div>

        {/* Linked Invoices */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text mb-4">
            Linked Invoices
          </h3>
          {deliveryData.invoices?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {deliveryData.invoices.map((inv) => (
                <span
                  key={inv._id}
                  onClick={() => navigate(`/invoice/${inv._id}`)}
                  className="cursor-pointer px-4 py-2 rounded-full bg-blue-100 text-blue-800 
                             dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 
                             dark:hover:bg-blue-800 transition"
                >
                  INV-{inv.invoice_number}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No invoices linked
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetail;

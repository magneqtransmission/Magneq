import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Button from "../../../components/buttons/Button";
import useManage from "../../../services/useManage";
import Input from "../../../components/forms/Input";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import Modal from "../../../components/common/Modal";

/**
 * EditSupplier Modal Component
 * 
 * This component provides a modal interface for editing supplier details.
 * It fetches the current supplier data and allows updating name and phone.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to close the modal
 * @param {string} props.supplierId - ID of the supplier to edit
 */
const EditSupplier = ({ isOpen, onClose, supplierId }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState("");
  const { getSupplierById, updateSupplier } = useManage();
  const queryClient = useQueryClient();

  // Fetch supplier data
  const {
    data: supplierData,
    isLoading: isLoadingSupplier,
    isError: isErrorSupplier,
  } = useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: () => getSupplierById(supplierId),
    enabled: !!supplierId && isOpen,
    staleTime: 1000 * 60 * 5,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateSupplier(supplierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["SUPPLIER"] });
      queryClient.invalidateQueries({ queryKey: ["supplier", supplierId] });
      toast.success("Supplier updated successfully!");
      onClose();
    },
    onError: (err) => {
      const errorMessage = err.message || "Failed to update supplier";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  // Update form when supplier data loads
  useEffect(() => {
    if (supplierData) {
      setForm({
        name: supplierData.name || "",
        phone: supplierData.phone || "",
        address: supplierData.address || "",
      });
      setError("");
    }
  }, [supplierData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.phone) {
      setError("Name and phone number are required");
      toast.error("Name and phone number are required");
      return;
    }

    updateMutation.mutate(form);
  };

  const handleClose = () => {
    setForm({ name: "", phone: "", address: "" });
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Supplier">
      {isLoadingSupplier && <p>Loading supplier details...</p>}
      {isErrorSupplier && <p className="text-red-500">Failed to load supplier details.</p>}
      
      {supplierData && (
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          <div className="space-y-4">
            <Input
              name="name"
              label="Supplier Name"
              placeholder="Enter supplier name"
              value={form.name}
              onChange={handleChange}
              required
            />
            
            <Input
              name="phone"
              label="Phone Number"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
              required
            />
            
            <Input
              name="address"
              label="Address"
              placeholder="Enter address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={updateMutation.isPending}
              disabled={updateMutation.isPending}
            >
              Update Supplier
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditSupplier;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Button from "../../../components/buttons/Button";
import useManage from "../../../services/useManage";
import Input from "../../../components/forms/Input";
import { useQueryClient } from "@tanstack/react-query";

const CreateSupplier = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    role: "SUPPLIER",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { createUser } = useManage();
  const queryClient = useQueryClient();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.phone) {
      setError("Name and phone number are required");
      toast.error("Name and phone number are required");
      return;
    }

    setLoading(true);
    try {
      await createUser(form);
      queryClient.invalidateQueries({ queryKey: ["SUPPLIER"] });
      toast.success("Supplier created successfully!");
      navigate("/manage_suppliers");
    } catch (err) {
      const errorMessage = err.message || "Failed to create supplier";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Supplier</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
          <Input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            size="lg"
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSupplier;

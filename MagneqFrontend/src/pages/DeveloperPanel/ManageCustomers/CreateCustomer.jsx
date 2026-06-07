import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Button from "../../../components/buttons/Button";
import useManage from "../../../services/useManage";
import Input from "../../../components/forms/Input";
import PasswordInput from "../../../components/forms/PasswordInput";
import { useQueryClient } from "@tanstack/react-query";
import { State } from "country-state-city"; // ✅ for states of India

const CreateCustomer = () => {
  const [form, setForm] = useState({
    name: "",
    role: "CUSTOMER",
    user_name: "",
    password: "",
    address: "",
    gst_no: "",
    phone: "",
    state: "",
    pin_code: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { createUser } = useManage();
  const queryClient = useQueryClient();

  const states = State.getStatesOfCountry("IN"); // ✅ only Indian states

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.user_name || !form.password) {
      setError("Name, username, and password are required");
      toast.error("Name, username, and password are required");
      return;
    }

    if (!form.state || !form.pin_code || !form.gst_no) {
      setError("State, Pin Code and GST Number are required");
      toast.error("State, Pin Code and GST Number are required");
      return;
    }

    setLoading(true);
    try {
      await createUser(form); // ✅ state & pin_code included
      queryClient.invalidateQueries({ queryKey: ["CUSTOMER"] });
      toast.success("Customer created successfully!");
      navigate("/manage_customers");
    } catch (err) {
      const errorMessage = err.message || "Failed to create customer";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Customer</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
          <Input name="user_name" placeholder="Username" value={form.user_name} onChange={handleChange} />
          <PasswordInput name="password" placeholder="Password" value={form.password} onChange={handleChange} />
          <Input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
          <Input name="gst_no" placeholder="GST Number" value={form.gst_no} onChange={handleChange} />
          <Input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />

          {/* State Dropdown */}
          <div>
            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg  bg-white dark:bg-gray-800"
            >
              <option value="">-- Select State --</option>
              {states.map((s) => (
                <option key={s.isoCode} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pin Code */}
          <Input
            name="pin_code"
            placeholder="Pin Code"
            value={form.pin_code}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button size="lg" type="button" variant="outline" onClick={() => navigate(-1)}>
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

export default CreateCustomer;

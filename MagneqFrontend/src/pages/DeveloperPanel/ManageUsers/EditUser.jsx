import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Button from "../../../components/buttons/Button";
import useManage from "../../../services/useManage";
import Input from "../../../components/forms/Input";
import Select from "../../../components/forms/Select";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getUserById, updateUser } = useManage();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({
    name: "",
    role: "",
  });

  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch user data
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      toast.success("User updated successfully!");
      navigate("/manage_users");
    },
    onError: (err) => {
      const errorMessage = err.message || "Failed to update user";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  // Populate form when user data is loaded
  useEffect(() => {
    if (userData) {
      setForm({
        name: userData.name || "",
        role: userData.role || "",
      });
      setUsername(userData.user_name || "");
    }
  }, [userData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.role) {
      setError("Name and role are required");
      toast.error("Name and role are required");
      return;
    }

    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p>Loading user details...</p>
      </div>
    );
  }

  if (isError || !userData) {
    return (
      <div className="p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-red-500">User not found</p>
        <Button onClick={() => navigate("/manage_users")} className="mt-4">
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Edit User</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Input 
            name="name" 
            placeholder="Name" 
            value={form.name} 
            onChange={handleChange}
            required
          />
          <Input 
            name="user_name" 
            placeholder="Username" 
            value={username} 
            disabled
            className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />
          <Select
            name="role"
            placeholder="Role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="SALES">SALES</option>
            <option value="ADMIN">ADMIN</option>
            <option value="PRODUCTION">PRODUCTION</option>
            <option value="PURCHASE">PURCHASE</option>
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="DEVELOPER">DEVELOPER</option>
          </Select>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button 
            size="lg" 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/manage_users")}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={updateMutation.isPending} 
            disabled={updateMutation.isPending}
          >
            Update User
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Button from "../../../components/buttons/Button";
import useManage from "../../../services/useManage";
import Input from "../../../components/forms/Input";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { State } from "country-state-city";

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomerById, updateCustomer } = useManage();
  const queryClient = useQueryClient();

  // Local state for form data - separate from backend data
  const [localFormData, setLocalFormData] = useState({
    name: "",
    address: "",
    gst_no: "",
    phone: "",
    state: "",
    pin_code: "",
  });

  const [username, setUsername] = useState("");
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hasPopulatedForm = useRef(false);

  const [error, setError] = useState("");
  const states = State.getStatesOfCountry("IN");

  // Fetch customer data
  const { data: customerData, isLoading, isError } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["CUSTOMER"] });
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      toast.success("Customer updated successfully!");
      navigate("/manage_customers");
    },
    onError: (err) => {
      const errorMessage = err.message || "Failed to update customer";
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  // Populate local form when customer data is loaded
  useEffect(() => {
    if (customerData && !hasPopulatedForm.current) {
      // Create a completely new local form object
      const newLocalFormData = {
        name: customerData.name || "",
        address: customerData.address || "",
        gst_no: customerData.gst_no || "",
        phone: customerData.phone || "",
        state: customerData.state || "", // Keep original state for now
        pin_code: customerData.pin_code || "",
      };

      setLocalFormData(newLocalFormData);
      setUsername(customerData.user_name || "");
      hasPopulatedForm.current = true;
    }
  }, [customerData]);


  // Debug local form state changes
  useEffect(() => {
    console.log('Local form state changed:', localFormData);
  }, [localFormData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  const handleStateSelect = (selectedState) => {
    console.log('Selecting state:', selectedState);
    setLocalFormData(prevForm => {
      const newForm = {
        ...prevForm,
        state: selectedState
      };
      console.log('New local form state:', newForm);
      return newForm;
    });
    setIsStateDropdownOpen(false);
  };

  const toggleStateDropdown = () => {
    setIsStateDropdownOpen(!isStateDropdownOpen);
  };

  // Helper function to get the proper case state for display
  const getDisplayState = () => {
    if (!localFormData.state || states.length === 0) return localFormData.state || "";
    const properCaseState = states.find(s => s.name.toUpperCase() === localFormData.state.toUpperCase())?.name;
    return properCaseState || localFormData.state;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!localFormData.name || !localFormData.gst_no || !localFormData.state || !localFormData.pin_code) {
      setError("Name, GST Number, State, and Pin Code are required");
      toast.error("Name, GST Number, State, and Pin Code are required");
      return;
    }

    console.log('Submitting local form data:', localFormData);
    updateMutation.mutate(localFormData);
  };

  if (isLoading) {
    return (
      <div className="p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p>Loading customer details...</p>
      </div>
    );
  }

  if (isError || !customerData) {
    return (
      <div className="p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-red-500">Customer not found</p>
        <Button onClick={() => navigate("/manage_customers")} className="mt-4">
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Edit Customer</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Input
            name="name"
            placeholder="Name"
            value={localFormData.name}
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
          <Input
            name="address"
            placeholder="Address"
            value={localFormData.address}
            onChange={handleChange}
          />
          <Input
            name="gst_no"
            placeholder="GST Number"
            value={localFormData.gst_no}
            onChange={handleChange}
          />
          <Input
            name="phone"
            placeholder="Phone Number"
            value={localFormData.phone}
            onChange={handleChange}
          />

          {/* Custom State Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex cursor-pointer" onClick={toggleStateDropdown}>
              <input
                type="text"
                value={getDisplayState()}
                placeholder="Select State"
                readOnly
                className="flex-1 px-3 py-2 border rounded-l-lg bg-white dark:bg-gray-800 border-r-0 focus:outline-none cursor-pointer"
              />
              <div className="px-3 py-2 border border-l-0 rounded-r-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center">
                <svg
                  className={`w-4 h-4 transition-transform ${isStateDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {isStateDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {states.map((state) => (
                  <div
                    key={state.isoCode}
                    onClick={() => handleStateSelect(state.name)}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${getDisplayState() === state.name ? 'bg-blue-100 dark:bg-blue-900' : ''
                      }`}
                  >
                    {state.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pin Code */}
          <Input
            name="pin_code"
            placeholder="Pin Code"
            value={localFormData.pin_code}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            size="lg"
            type="button"
            variant="outline"
            onClick={() => navigate("/manage_customers")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={updateMutation.isPending}
            disabled={updateMutation.isPending}
          >
            Update Customer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditCustomer;

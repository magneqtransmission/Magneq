import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../../components/buttons/Button";
import useRawMaterials from "../../../services/useRawMaterials";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

/**
 * EditRawMaterial Component
 * 
 * This component allows developers to edit existing raw material details.
 * It fetches the raw material data by ID and provides a form to modify:
 * - Name and Type (required fields)
 * - Minimum quantity threshold
 * 
 * Note: Quantity specifications (actual stock quantities) are not editable
 * to prevent accidental changes to stock levels. Only the minimum threshold
 * can be adjusted for inventory management purposes.
 * 
 * The component validates input and updates the raw material via the API.
 * After successful update, it invalidates relevant queries and navigates back.
 */
const EditRawMaterial = () => {
  const { id, class_type } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [minQuantity, setMinQuantity] = useState(10);

  const { getRawMaterialByClassAndId, updateRawMaterial } = useRawMaterials();

  // Fetch the raw material data
  const { data: rawMaterialData, isLoading: isFetching } = useQuery({
    queryKey: ["raw_material", class_type, id],
    queryFn: () => getRawMaterialByClassAndId(class_type, id),
    enabled: !!id && !!class_type,
  });
  
  // Initialize form data when raw material data is loaded
  useEffect(() => {
    if (rawMaterialData) {
      const data = rawMaterialData;
      setName(data.name || "");
      setType(data.type || "");
      setMinQuantity(data.min_quantity || 10);
    }
  }, [rawMaterialData]);


  const { mutate: updateMutation, isLoading } = useMutation({
    mutationFn: ({ id, data }) => updateRawMaterial(id, data),
    onSuccess: () => {
      toast.success("Raw Material Updated Successfully!");
      queryClient.invalidateQueries({ queryKey: ["raw_materials"] });
      queryClient.invalidateQueries({ queryKey: ["raw_material", class_type, id] });
      navigate(`/raw_material/${class_type}`);
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error(
        "Update failed: " + (error?.response?.data?.error || "Unknown error")
      );
    },
  });

  const handleSubmit = () => {
    if (!name || !type) {
      toast.error("Name and Type are required.");
      return;
    }

    const payload = {
      class_type,
      name,
      type,
      min_quantity: minQuantity,
    };

    updateMutation({ id, data: payload });
  };

  if (isFetching) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading raw material data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!rawMaterialData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="text-lg text-red-500 mb-4">Raw material not found</div>
            <Button onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          Edit Raw Material (Class {class_type})
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Name
            </label>
            <input
              id="name"
              className="w-full border-b border-gray-300 dark:border-gray-600 px-3 py-2 outline-none focus:border-brand-500 dark:bg-gray-700 dark:text-gray-200 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Type
            </label>
            <input
              id="type"
              className="w-full border-b border-gray-300 dark:border-gray-600 px-3 py-2 outline-none focus:border-brand-500 dark:bg-gray-700 dark:text-gray-200 rounded"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="minQuantity"
              className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Minimum Quantity
            </label>
            <input
              id="minQuantity"
              type="number"
              min="0"
              className="w-full border-b border-gray-300 dark:border-gray-600 px-3 py-2 outline-none focus:border-brand-500 dark:bg-gray-700 dark:text-gray-200 rounded"
              value={minQuantity}
              onChange={(e) => setMinQuantity(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditRawMaterial;

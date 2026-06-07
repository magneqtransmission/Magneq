import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../../components/buttons/Button";
import { LuTrash } from "react-icons/lu";
import useRawMaterials from "../../../services/useRawMaterials";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Badge from "../../../components/common/Badge";

const CreateRawMaterial = () => {
  const { class_type } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [specs, setSpecs] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const { createRawMaterial } = useRawMaterials();

  useEffect(() => {
    setName("");
    setType("");
    setSpecs([]);
    setNewKey("");
    setNewValue("");
  }, [class_type]);

  const handleAddSpec = () => {
    if (!newKey || !newValue) {
      toast.error("Please enter both a key and a value.");
      return;
    }
    setSpecs([...specs, { key: newKey, value: newValue }]);
    setNewKey("");
    setNewValue("");
  };

  const handleRemoveSpec = (index) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const { mutate: createMutation, isLoading } = useMutation({
    mutationFn: createRawMaterial,
    onSuccess: () => {
      toast.success("Raw Material Created!");
      navigate(`/raw_material/${class_type}`);
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error(
        "Creation failed: " + (error?.response?.data?.error || "Unknown error")
      );
    },
  });

  const handleSubmit = () => {
    if (!name || !type) {
      toast.error("Name and Type are required.");
      return;
    }

    const quantity = specs.reduce((acc, curr) => {
      if (curr.key) acc[curr.key] = curr.value;
      return acc;
    }, {});

    const payload = {
      class_type,
      name,
      type,
      quantity,
    };

    createMutation(payload); // trigger backend mutation
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          Create Raw Material (Class {class_type})
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

          <div className="mt-6">
            <h3 className="text-md sm:text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Specifications
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <input
                placeholder="Key (e.g., Color)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 px-3 py-2 outline-none focus:border-brand-500 dark:bg-gray-700 dark:text-gray-200 rounded"
              />
              <input
                placeholder="Value (e.g., Red)"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-600 px-3 py-2 outline-none focus:border-brand-500 dark:bg-gray-700 dark:text-gray-200 rounded"
              />
              <Button
                className="w-full sm:w-auto px-4 py-2"
                size="sm"
                onClick={handleAddSpec}
              >
                + Add
              </Button>
            </div>

            {specs.length === 0 ? (
              <p className="text-sm text-gray-400">
                No specifications added. Click '+ Add' to add one.
              </p>
            ) : (
              <div className="space-y-2">
                {specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-2 rounded-md border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
                      <input
                        value={spec.key}
                        onChange={(e) =>
                          handleSpecChange(idx, "key", e.target.value)
                        }
                        className="flex-1 border border-gray-200 dark:border-gray-600 px-3 py-2 outline-none dark:bg-gray-700 dark:text-gray-200 rounded"
                        placeholder="Key"
                      />
                      <input
                        value={spec.value}
                        onChange={(e) =>
                          handleSpecChange(idx, "value", e.target.value)
                        }
                        className="flex-1 border border-gray-200 dark:border-gray-600 px-3 py-2 outline-none dark:bg-gray-700 dark:text-gray-200 rounded"
                        placeholder="Value"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemoveSpec(idx)}
                      className="w-full sm:w-auto"
                    >
                      <Badge color="error">
                        <LuTrash />
                        <span className="ml-2">Remove</span>
                      </Badge>
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateRawMaterial;

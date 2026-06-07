import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useProduction from "../../services/useProduction";
import useFinishedGoods from "../../services/useFinishedGoods";
import Button from "../buttons/Button";

const DailyProductionForm = ({ onClose }) => {
  const [selectedFinishedGood, setSelectedFinishedGood] = useState("");
  const [quantity, setQuantity] = useState("");
  const queryClient = useQueryClient();
  
  const { addDailyProduction } = useProduction();
  const { getAllFinishedGoods } = useFinishedGoods();

  // Fetch finished goods for dropdown
  const { data: finishedGoodsData, isLoading: isLoadingFinishedGoods } = useQuery({
    queryKey: ["finished-goods"],
    queryFn: getAllFinishedGoods,
  });

  const {
    mutate: addProduction,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: (productionData) => addDailyProduction(productionData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["finished-goods"] });
      queryClient.invalidateQueries({ queryKey: ["pendingProductions"] });
      toast.success(response.data.message);
      setSelectedFinishedGood("");
      setQuantity("");
      onClose();
    },
    onError: (err) => {
      console.error("Daily production failed:", err);
      toast.error(err.response?.data?.error || "Failed to add daily production. Please try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedFinishedGood) {
      toast.error("Please select a finished good");
      return;
    }
    
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const payload = {
      finished_good_id: selectedFinishedGood,
      quantity: parseInt(quantity),
    };

    addProduction(payload);
  };

  const finishedGoods = finishedGoodsData?.data || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Add Daily Production</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Finished Good
              </label>
              <select
                value={selectedFinishedGood}
                onChange={(e) => setSelectedFinishedGood(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                disabled={isLoadingFinishedGoods}
              >
                <option value="">
                  {isLoadingFinishedGoods ? "Loading..." : "Select a finished good"}
                </option>
                {finishedGoods.map((fg) => (
                  <option key={fg._id} value={fg._id}>
                    {fg.model} - {fg.type} - {fg.ratio} - {fg.power}W
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Produced Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter quantity produced"
                min="1"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isPending || !selectedFinishedGood || !quantity}
              >
                {isPending ? "Adding..." : "Add Production"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DailyProductionForm;

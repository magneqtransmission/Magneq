import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useRawMaterials from "../../services/useRawMaterials";
import Button from "../../components/buttons/Button";
import {toast} from "react-hot-toast";

const RejectedQuantity = ({ id, class_type }) => {
  const { rejectedqty } = useRawMaterials();

  const [showInput, setShowInput] = useState(false);
  const [qty, setQty] = useState("");
  const queryClient = useQueryClient();
  // Mutation for updating rejected qty
  const mutation = useMutation({
    mutationFn: ({ qtyValue, class_type }) => rejectedqty(id, qtyValue, class_type),
    onSuccess: (data) => {
      setQty("");
      setShowInput(false);
      queryClient.invalidateQueries({ queryKey: ["rawMaterialDetail",class_type,id] })
      toast.success("Rejected quantity updated successfully!");
    },
    onError: (error) => {
      // If backend sends custom error message
      const msg = error?.response?.data?.message || "Failed to update rejected quantity";
      toast.error(msg);
    },
  });

  return (
    <div className="space-y-2">
      {!showInput ? (
        <Button onClick={() => setShowInput(true)}>Add Rejected Qty</Button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="border rounded p-1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="Enter qty"
          />
          <Button
            onClick={() =>
              mutation.mutate({ qtyValue: Number(qty), class_type })
            }
            loading={mutation.isPending}
          >
            Submit
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowInput(false);
              setQty("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default RejectedQuantity;

import React from "react";
import SearchBar from "../../../components/common/Searchbar";
import useProduction from "../../../services/useProduction";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Button from "../../../components/buttons/Button";
import { HiOutlineArchiveBox } from "react-icons/hi2";
import DaynamicTable from "../../../components/common/Table";
import ItemNotInStock from "./ItemNotInStock";
import useNotification from "../../../services/useNotification";
import { toast } from "react-hot-toast";

// Helper to structure raw data
const formatClassData = (classItems) => {
  return {
    item: classItems.map((item) => ({
      id: item._id,
      data: [
        item.name || "Unnamed",
        `${item.available} / ${item.required}`,
        item.in_stock ? "In Stock" : "Not in Stock",
      ],
    })),
  };
};

// Custom cell formatter for capsules
const formatCellWithCapsules = (cell, idx) => {
  if (idx === 1 && typeof cell === "string") {
    const [available, required] = cell.split(" / ");
    return (
      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        {available} / {required}
      </span>
    );
  }

  if (idx === 2 && typeof cell === "string") {
    const isInStock = cell === "In Stock";
    return (
      <span
        className={`inline-block px-2 py-1 text-xs text-nowrap font-semibold rounded-full ${isInStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
      >
        {cell}
      </span>
    );
  }

  return cell;
};

const ProductionDetails = () => {
  const { getProductionById } = useProduction();
  const { id: production_id } = useParams();
  const { createNotification } = useNotification();
  const queryClient = useQueryClient();
  const { isLoading, data } = useQuery({
    queryKey: ["productionId", production_id],
    queryFn: () => getProductionById(production_id),
  });

  const handleNotifyToPurchase = async () => {
    if (!data) return;

    const allClasses = [...(data.class_a || []), ...(data.class_b || []), ...(data.class_c || [])];
    const outOfStockItems = allClasses.filter((item) => item.in_stock === false);

    if (outOfStockItems.length === 0) {
      toast.info("All items are in stock. No notification needed.");
      return;
    }

    const message = outOfStockItems
      .map((item) => `${item.name} - Required: ${item.required}`)
      .join(", ");

    try {
      await createNotification({
        type: "purchase",
        role: "PURCHASE",
        payload: { message },
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("Notification sent to Purchase team.");
    } catch (error) {
      console.error("Failed to send notification:", error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || "Error sending notification.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) return <p>Loading production details...</p>;
  const dynamicHeader = ["Name | Type", "Ava/Req", "Stock Status"];

  return (
    <div className="grid gap-4 md:gap-6 bg-background text-text">
      <SearchBar className={"max-w-xs"} placeholder={"Search using Order Id"} />

      <div className="flex justify-between items-center pt-5">
        <h2 className="font-semibold text-text text-2xl">Detailed View</h2>
        <div className="flex items-center justify-center">
          {(!data?.all_in_stock && data?.status === "UN_PROCESSED") &&
            <Button
              size="lg"
              type="button"
              startIcon={<HiOutlineArchiveBox size={18} />}
              onClick={handleNotifyToPurchase}
            >
              Notify To Purchase
            </Button>}
        </div>
      </div>

      <div>
        <DaynamicTable
          header={["Production ID", "Model", "Type", "Ratio", "Total Sales Quantity", "Production Pending Quantity", "Status"]}
          tableData={{
            item: [
              {
                id: data?.production_id || "prod-id",
                data: [
                  data?.pro_id ? `PRO-${data.pro_id}` : 'N/A',
                  data?.finished_good?.model,
                  data?.finished_good?.type,
                  data?.finished_good?.ratio,
                  data?.total_sales_quantity || 0, // Total Sales Quantity
                  data?.production_pending_quantity || 0, // Production Pending Quantity
                  data?.status,
                ],
              },
            ],
          }}
        />
      </div>
      {!data?.all_in_stock && <ItemNotInStock />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h2 className="text-xl font-semibold py-2">Class A</h2>
          <DaynamicTable
            header={dynamicHeader}
            tableData={formatClassData(data?.class_a || [])}
            formatCell={formatCellWithCapsules}
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold py-2">Class B</h2>
          <DaynamicTable
            header={dynamicHeader}
            tableData={formatClassData(data?.class_b || [])}
            formatCell={formatCellWithCapsules}
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold py-2">Class C</h2>
          <DaynamicTable
            header={dynamicHeader}
            tableData={formatClassData(data?.class_c || [])}
            formatCell={formatCellWithCapsules}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductionDetails;

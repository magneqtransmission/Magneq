import React from "react";
import { useQuery } from "@tanstack/react-query";
import useSales from "../../services/useSales";

const SalesOrderDropdown = ({ customerId, salesId, setSalesId, setSale }) => {
  const { getSalesOfCustomer } = useSales();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["sales-orders", customerId],
    queryFn: () => getSalesOfCustomer(customerId),
    enabled: !!customerId,
  });

  const handleChange = (e) => {
    const selectedId = e.target.value;
    const selectedOrder = orders.find((o) => o.id === selectedId);
    setSalesId(selectedId); // _id for API
    setSale(selectedOrder || {}); // full object for frontend
  };

  return (
    <div className="bg-background">
      <label className="block text-sm font-medium mb-1">Sales Order</label>
      <select
        value={salesId}
        onChange={handleChange}
        className=" bg-white dark:bg-gray-900 w-full px-3 py-2 border rounded-lg "
        disabled={!customerId || isLoading}
      >
        <option value="" >Select Sales Order</option>
        {orders.map((order) => (
          <option key={order.id} value={order.id} className=" bg-white dark:bg-gray-900">
            {order.order_id} - ({order.models})
          </option>
        ))}
      </select>
    </div>
  );
};

export default SalesOrderDropdown;

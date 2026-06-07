import React from "react";
import { MdErrorOutline } from "react-icons/md";

const ItemNotInStock = () => {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-4 py-3 w-full border"
      style={{
        borderColor: "rgba(255, 0, 0, 0.3)",
        background: "rgba(255, 0, 0, 0.05)",
      }}
    >
      <MdErrorOutline className="text-xl" style={{color: "#f87171"}} />
      <span className="font-semibold">Items not in Stock</span>
    </div>
  );
};

export default ItemNotInStock;

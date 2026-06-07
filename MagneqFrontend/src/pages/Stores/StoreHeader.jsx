import React from "react";
import { useQuery } from "@tanstack/react-query";
import StoresCard from "../../components/card/StoresCard";
import { HiOutlineArchiveBox } from "react-icons/hi2";
import { PiCubeDuotone } from "react-icons/pi";
import { MdErrorOutline, MdOutlineMail } from "react-icons/md";
import useRawMaterials from "../../services/useRawMaterials";
import { HiOutlineClock } from "react-icons/hi2";
import Button from "../../components/buttons/Button";
import { useNavigate } from "react-router-dom";

const StoreHeader = ({ activeClass, onClassChange }) => {
  const { getRawMaterialStockStats } = useRawMaterials();
  const navigate = useNavigate();

  const { data: stockStats, isLoading } = useQuery({
    queryKey: ["rawMaterialStockStats"],
    queryFn: getRawMaterialStockStats,
  });

  const getStockStatus = (classType) => {
    if (isLoading || !stockStats) return "Loading...";
    
    const stats = stockStats[classType];
    if (!stats) return "No Data";
    
    const total = stats.inStock + stats.lowQuantity + stats.outOfStock;
    if (total === 0) return "No Data";
    
    if (stats.outOfStock === 0 && stats.lowQuantity === 0) {
      return "All In Stock";
    } else if (stats.inStock === 0 && stats.lowQuantity === 0) {
      return "All Out of Stock";
    } else {
      const parts = [];
      if (stats.inStock > 0) parts.push(`${stats.inStock} In Stock`);
      if (stats.lowQuantity > 0) parts.push(`${stats.lowQuantity} Low`);
      if (stats.outOfStock > 0) parts.push(`${stats.outOfStock} Out`);
      return parts.join(", ");
    }
  };

  const getBorderColor = (classType) => {
    if (isLoading || !stockStats) return undefined;
    
    const stats = stockStats[classType];
    if (!stats) return undefined;
    
    if (stats.outOfStock === 0 && stats.lowQuantity === 0) {
      return "#22C55E"; // Green for all in stock
    } else if (stats.inStock === 0 && stats.lowQuantity === 0) {
      return "#EF4444"; // Red for all out of stock
    } else if (stats.outOfStock > 0) {
      return "#EF4444"; // Red if any out of stock
    } else if (stats.lowQuantity > 0) {
      return "#F59E0B"; // Yellow for low quantity
    } else {
      return "#22C55E"; // Green for all in stock
    }
  };

  const cards = [
    {
      title: "A Class",
      icon: HiOutlineArchiveBox,
      class: "A",
      percent: getStockStatus("A"),
      borderColor: getBorderColor("A"),
    },
    {
      title: "B Class",
      icon: PiCubeDuotone,
      class: "B",
      percent: getStockStatus("B"),
      borderColor: getBorderColor("B"),
    },
    {
      title: "C Class",
      icon: MdOutlineMail,
      class: "C",
      percent: getStockStatus("C"),
      borderColor: getBorderColor("C"),
    },
  ];

  return (
    <div>
      {/* Tab Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full mt-8">
        {cards.map(({ title, icon, percent, borderColor, class: cls }) => (
          <div
            key={cls}
            onClick={() => onClassChange(cls)}
            className={`cursor-pointer rounded-xl transition-transform ${
              activeClass === cls ? "scale-[1.02]" : "opacity-80"
            }`}
          >
            <StoresCard
              title={title}
              icon={icon}
              percent={percent}
              borderColor={activeClass === cls ? "#3b82f6" : borderColor}
            />
          </div>
        ))}
      </div>

      {/* Dynamic Section Title */}
      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center gap-3">
          <span
            className="font-bold text-2xl capitalize text-text"
          >
            {activeClass} Class Items
          </span>
          {!isLoading && stockStats && (() => {
            const stats = stockStats[activeClass];
            if (!stats) return null;
            
            if (stats.outOfStock > 0) {
              return (
                <span
                  className="inline-flex items-center text-xs font-medium rounded px-2 py-0.5"
                  style={{ 
                    color: "#DC2626",
                    background: "#FEE2E2"
                  }}
                >
                  {stats.outOfStock} Out of Stock
                </span>
              );
            } else if (stats.lowQuantity > 0) {
              return (
                <span
                  className="inline-flex items-center text-xs font-medium rounded px-2 py-0.5"
                  style={{ 
                    color: "#D97706",
                    background: "#FEF3C7"
                  }}
                >
                  {stats.lowQuantity} Low Quantity
                </span>
              );
            } else {
              return (
                <span
                  className="inline-flex items-center text-xs font-medium rounded px-2 py-0.5"
                  style={{ 
                    color: "#15803d",
                    background: "#dcfce7"
                  }}
                >
                  All In Stock
                </span>
              );
            }
          })()}
        </div>

        <Button 
          variant="outline" 
          startIcon={<HiOutlineClock />} 
          onClick={() => navigate("/history/raw_material")}
        >
          History
        </Button>
      </div>

      {/* Warning Bar - Show if there are out of stock or low quantity items */}
      {!isLoading && stockStats && (() => {
        const stats = stockStats[activeClass];
        if (!stats) return null;
        
        if (stats.outOfStock > 0) {
          return (
            <div
              className="flex items-center gap-2 rounded-lg px-4 py-3 mt-6 w-full border"
              style={{
                borderColor: "rgba(255, 0, 0, 0.3)",
                background: "rgba(255, 0, 0, 0.05)",
              }}
            >
              <MdErrorOutline className="text-xl" style={{ color: "#f87171" }} />
              <span className="font-semibold">
                {stats.outOfStock} Items Out of Stock
              </span>
            </div>
          );
        } else if (stats.lowQuantity > 0) {
          return (
            <div
              className="flex items-center gap-2 rounded-lg px-4 py-3 mt-6 w-full border"
              style={{
                borderColor: "rgba(245, 158, 11, 0.3)",
                background: "rgba(245, 158, 11, 0.05)",
              }}
            >
              <MdErrorOutline className="text-xl" style={{ color: "#f59e0b" }} />
              <span className="font-semibold">
                {stats.lowQuantity} Items with Low Quantity
              </span>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
};

export default StoreHeader;

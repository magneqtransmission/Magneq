import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import SearchBar from "../components/common/SearchBar";
import Button from "../components/buttons/Button";
import { HiOutlineArchiveBox } from "react-icons/hi2";
import { PiCubeDuotone } from "react-icons/pi";
import PurchaseMetrics from "../components/purchase/PurchaseMetrix";

const Purchase = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-background text-text min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8">
        {/* Search Bar */}
        <div className="w-full md:w-80">
          <SearchBar placeholder="Search using Order Id" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 sm:mt-0">
          <Button
            type="button"
            size="md"
            variant="primary"
            startIcon={<HiOutlineArchiveBox />}
            onClick={() => navigate("/create_po")}
            className="w-full sm:w-auto"
          >
            Purchase Goods
          </Button>
          <Button
            type="button"
            size="md"
            variant="secondary"
            startIcon={<PiCubeDuotone />}
            onClick={() => navigate("/track_po")}
            className="w-full sm:w-auto"
          >
            Track Purchase
          </Button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="mb-8">
        <PurchaseMetrics />
      </div>

      {/* Outlet for Nested Routes */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-sm p-4 sm:p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default Purchase;
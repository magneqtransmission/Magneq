import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Metrics from "../../components/sales/adminSales/Metrics";
import SalesTable from "../../components/sales/adminSales/SalesTable";
import SearchBar from "../../components/common/Searchbar";
import Button from "../../components/buttons/Button";
import { HiOutlineArchiveBox } from "react-icons/hi2";
import { PiCubeDuotone } from "react-icons/pi";
import { FiSearch } from "react-icons/fi";

const Sales = () => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  return (
    <div className="p-2 sm:p-6 md:p-8 bg-background text-text space-y-6">
      {/* Top Bar: Search + Actions */}
      <div className="flex items-center gap-3" ref={searchRef}>
        {/* Desktop Search (always visible) */}
        <div className="hidden md:block w-full max-w-md">
          <SearchBar placeholder="Search using Order Id" />
        </div>

        {/* Mobile Search Toggle */}
        <div className="flex md:hidden items-center gap-2 w-full">
          {searchOpen ? (
            <div className="flex-1">
              <SearchBar placeholder="Search using Order Id" autoFocus />
            </div>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                startIcon={<FiSearch />}
                onClick={() => setSearchOpen(true)}
                className="flex-shrink-0"
              >
                Search
              </Button>
              <Button
                type="button"
                size="sm"
                variant="primary"
                startIcon={<HiOutlineArchiveBox />}
                onClick={() => navigate("/create_order")}
                className="flex-1"
              >
                Create
              </Button>
              <Button
                type="button"
                size="sm"
                variant="primary"
                startIcon={<PiCubeDuotone />}
                onClick={() => navigate("/track_order")}
                className="flex-1"
              >
                Track
              </Button>
              <Button
                type="button"
                size="sm"
                variant="primary"
                startIcon={<PiCubeDuotone />}
                onClick={() => navigate("/payment")}
                className="flex-1"
              >
                Payment
              </Button>
            </>
          )}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-3">
          <Button
            type="button"
            size="md"
            variant="primary"
            startIcon={<HiOutlineArchiveBox />}
            onClick={() => navigate("/create_order")}
          >
            Create Order
          </Button>
          <Button
            type="button"
            size="md"
            variant="primary"
            startIcon={<PiCubeDuotone />}
            onClick={() => navigate("/track_order")}
          >
            Track Orders
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl shadow-md">
        <Metrics />
      </div>

      {/* Sales Table */}
      <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl shadow-md overflow-x-auto">
        <SalesTable isDashboard />
      </div>
    </div>
  );
};

export default Sales;

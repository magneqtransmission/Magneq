import React, { useState, useRef, useEffect } from "react";
import { HiOutlineArchiveBox, HiOutlineClock } from "react-icons/hi2";
import { PiCubeDuotone } from "react-icons/pi";
import { FiSearch } from "react-icons/fi";
import { MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../features/authSlice";

import Button from "../components/buttons/Button";
import SearchBar from "../components/common/Searchbar";
import ProductionTable from "../components/dashboard/ProductionTable";

const Production = () => {
  const navigate = useNavigate();
  const user = useSelector(selectAuth);
  const userRole = user?.route?.role;
  const userRoleProduction =
    userRole === "PRODUCTION" || userRole === "ADMIN";

  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Close search on outside click
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
    <div className="p-4 sm:p-6 md:p-8 bg-background text-text space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-3" ref={searchRef}>
        {/* Desktop Search */}
        <div className="hidden md:block w-full max-w-md">
          <SearchBar placeholder="Search using Order Id" />
        </div>

        {/* Mobile Toggle */}
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
                variant="outline"
                startIcon={<HiOutlineClock />}
                onClick={() => navigate("/history/production")}
                className="flex-shrink-0"
              >
                History
              </Button>
              {/* {userRoleProduction && (
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  startIcon={<PiCubeDuotone />}
                  className="shadow-theme-xs flex-1"
                  onClick={() => navigate("/create_pro")}
                >
                  Create PRO
                </Button>
              )} */}
              {userRoleProduction && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  startIcon={<MdAdd />}
                  className="shadow-theme-xs flex-1"
                  onClick={() => navigate("/daily_production")}
                >
                  Daily Production
                </Button>
              )}
            </>
          )}
        </div>

        {/* Desktop Buttons */}
        {userRoleProduction && (
          <div className="hidden md:flex gap-3">
            {/* <Button
              type="button"
              size="md"
              variant="primary"
              startIcon={<PiCubeDuotone />}
              className="shadow-theme-xs px-3"
              onClick={() => navigate("/create_pro")}
            >
              Create PRO
            </Button> */}
            <Button
              type="button"
              size="md"
              variant="secondary"
              startIcon={<MdAdd />}
              className="shadow-theme-xs px-3"
              onClick={() => navigate("/daily_production")}
            >
              Daily Production
            </Button>
            <Button
              type="button"
              size="md"
              variant="outline"
              startIcon={<HiOutlineClock />}
              className="shadow-theme-xs px-3"
              onClick={() => navigate("/history/production")}
            >
              History
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl shadow-md overflow-x-auto">
        <ProductionTable />
      </div>
    </div>
  );
};

export default Production;

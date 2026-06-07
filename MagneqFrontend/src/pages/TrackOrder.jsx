import React from "react";
import SearchBar from "../components/common/Searchbar";
import SalesTable from "../components/sales/adminSales/SalesTable";
import Button from "../components/buttons/Button";
import { PiCubeDuotone } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../features/authSlice";

const TrackOrder = () => {
  const navigate = useNavigate();
  const user = useSelector(selectAuth);
  const role = user?.user?.role;

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 bg-background text-text rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2 mb-6">
        <h1 className="font-semibold text-2xl md:text-3xl text-text">
          Track Order
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <SearchBar placeholder="Search using Order Id" />
          {role === "ADMIN" && (
            <Button
              type="button"
              size="md"
              variant="primary"
              startIcon={<PiCubeDuotone />}
              onClick={() => {
                navigate("/payment");
              }}
              className="w-full sm:w-auto"
            >
              Add Payment
            </Button>
          )}
        </div>
      </div>
      <SalesTable />
    </div>
  );
};

export default TrackOrder;
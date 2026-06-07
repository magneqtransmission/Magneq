import React from "react";
import Button from "../../components/buttons/Button";
import SearchBar from "../../components/common/Searchbar";
import { HiOutlineArchiveBox } from "react-icons/hi2";
import { Outlet, useNavigate } from "react-router-dom";
import { PiCubeDuotone } from "react-icons/pi";
import { useSelector } from "react-redux";
import { selectAuth } from "../../features/authSlice";

const Invoice = () => {
  const navigate = useNavigate();
  const auth = useSelector(selectAuth);
  const isCustomer = auth?.route?.role === "CUSTOMER";
  const isSales = auth?.route?.role === "SALES";
  return (
    <div
      className="min-h-screen p-4 sm:p-6 md:p-8"
      style={{
        background: "rgba(var(--background))",
        color: "rgba(var(--text))",
      }}
    >
      
      <Outlet />
    </div>
  );
};

export default Invoice; 
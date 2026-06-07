import React, { useState } from "react";
import Button from "../../components/buttons/Button";
import SearchBar from "../../components/common/Searchbar";
import { HiOutlineArchiveBox } from "react-icons/hi2";
import { Outlet, useNavigate } from "react-router-dom";

const Delivery = () => {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen"
      style={{
        background: "rgba(var(--background))",
        color: "rgba(var(--text))",
      }}
    >
      <div className="flex flex-row gap-4 md:gap-6 bg-transparent mx-auto">
        <div className="w-72">
          <SearchBar placeholder="Search using Name" />
        </div>
        <Button
          onClick={() => navigate("/delivery/create")}
          type="button"
          size="md"
          variant="primary"
          startIcon={<HiOutlineArchiveBox />}
          className="min-w-[160px] shadow-theme-xs"
        >
          Create Delivery
        </Button>
      </div>
      <Outlet />
    </div>
  );
};

export default Delivery;

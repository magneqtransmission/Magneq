import React, { useState } from "react";
import Button from "../../components/buttons/Button";
import SearchBar from "../../components/common/Searchbar";
import { HiOutlineArchiveBox, HiOutlineClock } from "react-icons/hi2";
import StoreHeader from "./StoreHeader";
import RawItemList from "./RawItemList";
import { Outlet, useNavigate } from "react-router-dom";

const Stores = () => {
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
          onClick={() => navigate("/store/add")}
          type="button"
          size="md"
          variant="primary"
          startIcon={<HiOutlineArchiveBox />}
          className="min-w-[160px] shadow-theme-xs"
        >
          Add Stock
        </Button>
        <Button
          variant="outline"
          startIcon={<HiOutlineClock />}
          onClick={() => navigate("/history/raw_material")}
        >
          History
        </Button>
      </div>
      <Outlet />
    </div>
  );
};

export default Stores;

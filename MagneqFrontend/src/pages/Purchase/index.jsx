import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router";
import { HiOutlineArchiveBox, HiOutlineClock } from "react-icons/hi2"; //sales box
import { PiCubeDuotone } from "react-icons/pi";
import SearchBar from "../../components/common/Searchbar";
import Button from "../../components/buttons/Button";

const Purchase = () => {
  const navigate = useNavigate();
  const headers = [
    "Production Id",
    "Vendor Name",
    "Date of purchase",
    "Order Details",
    "Status",
  ];
  //   const data = useSelector((state) => state.purchase);

  return (
    <div className="grid gap-4 md:gap-6 bg-background text-text">
      <SearchBar placeholder={"Search using Order Id"} />
      <Button
        type="button"
        size="md"
        variant="primary"
        startIcon={<HiOutlineArchiveBox />}
        onClick={() => {
          navigate("/purchase/create");
        }}
      >
        Purchase Goods
      </Button>
      <Button
        type="button"
        size="md"
        variant="primary"
        startIcon={<PiCubeDuotone />}
        onClick={() => {
          navigate("/purchase/track_vendor");
        }}
      >
        Track Vendor Purchases
      </Button>
      <Button
        type="button"
        size="md"
        variant="primary"
        startIcon={<PiCubeDuotone />}
        onClick={() => {
          navigate("/purchase/short");
        }}
      >
        Short Items
      </Button>
      <Button
        variant="outline"
        startIcon={<HiOutlineClock />}
        onClick={() => navigate("/history/raw_material")}
      >
        History
      </Button>
      <div className="col-span-12 ">
        <Outlet />
      </div>
    </div>
  );
};

export default Purchase;

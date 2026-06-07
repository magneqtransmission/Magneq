import React from "react";
import Button from "../../components/buttons/Button";
import {HiOutlineArchiveBox} from "react-icons/hi2";

const ClassDetail = () => {
  return (
    <div
      className="mt-8 rounded-2xl shadow-sm w-[900px] max-w-full px-8 py-8 border flex flex-col gap-6 mr-auto text-sm text-gray-500"
      style={{
        background: "rgba(var(--background))",

        borderColor: "rgba(var(--border))",
      }}
    >
      <div className="flex flex-row gap-8">
        <div className="flex-1">
          <div>Item Name - abc</div>
          <div>Vendor Name - Mohan Kumar</div>
          <div>Date of Purchasing - 22/06/2025</div>
          <div>Quantity - 1000</div>
          <div>Status - in Stock</div>
          <div className="">Vendor Contact : 91XXXXXXXXXX</div>
        </div>

        <div className="flex-1">
          <div>item gets used in :</div>
          <div>1$ase model</div>
          <div>1$ase model</div>
          <div>1$ase model</div>
          <div>1$ase model</div>
          <div>1$ase model</div>
        </div>

        <div className="flex-1">
          <div>Description :</div>
          <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
            <br />
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
            <br />
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur.
            <br />
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum.
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-6 mt-2">
        <Button
          type="button"
          size="md"
          variant="primary"
          startIcon={<HiOutlineArchiveBox />}
          className="min-w-[160px] shadow-theme-xs h-10"
        >
          Edit Stock
        </Button>
        <Button
          type="button"
          size="md"
          variant="primary"
          startIcon={<HiOutlineArchiveBox />}
          className="min-w-[160px] shadow-theme-xs h-10"
        >
          Delete Stock
        </Button>
      </div>
    </div>
  );
};

export default ClassDetail;

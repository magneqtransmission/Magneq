import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StoreHeader from "./StoreHeader";
import DaynamicTable from "../../components/common/Table"; // adjust import as needed

const StoreList = () => {
  const { classType = "A" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({
    header: [],
    item: [],
    page_no: 1,
    total_pages: 1,
    total_items: 0,
  });

  const mockData = {
    A: {
      header: ["Class", "Other Specification", "Quantity", "Casting Product"],
      item: [
        {
          id: "686a263c4b1d65f3d8c83bbc",
          data: ["A", "", "0", "UNFLATTEN"],
        },
        {
          id: "686a263c4b1d65f3d8c83bbd",
          data: ["A", "", "0", "FLATTEN"],
        },
        {
          id: "686a263c4b1d65f3d8c83bbe",
          data: ["A", "", "0", "FLATTEN"],
        },
      ],
      page_no: 1,
      total_pages: 1,
      total_items: 3,
    },
    B: {
      header: ["Class", "Product", "Quantity", "Status"],
      item: [
        {
          id: "b1",
          data: ["B", "Transformer", "40", "IN_STOCK"],
        },
        {
          id: "b2",
          data: ["B", "Switchgear", "25", "OUT_OF_STOCK"],
        },
      ],
      page_no: 1,
      total_pages: 1,
      total_items: 2,
    },
    C: {
      header: ["Class", "Other Specification", "Quantity", "Select Items", "Expiry Date"],
      item: [
        {
          id: "c1",
          data: ["C", "Special use", "12", ["type-A", "type-B"], "2025-09-01"],
        },
      ],
      page_no: 1,
      total_pages: 1,
      total_items: 1,
    },
  };

  useEffect(() => {
    // Simulate data fetch based on classType
    setData(mockData[classType] || mockData.A);
  }, [classType]);

  return (
    <div>
      <StoreHeader />
      <div className="mt-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <DaynamicTable
          header={data.header}
          tableData={data}
          formatCell={(cell, idx, id) => {
            if (Array.isArray(cell)) {
              return (
                <div className="flex flex-wrap gap-2">
                  {cell.map((entry, i) => (
                    <div
                      key={i}
                      className="bg-background text-text text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
                    >
                      {entry}
                    </div>
                  ))}
                </div>
              );
            }
            return cell;
          }}
        />
      </div>
    </div>
  );
};

export default StoreList;

import React, {useEffect, useState} from "react";
import {HiOutlineArchiveBox} from "react-icons/hi2"; // Sales box
import {PiCubeDuotone} from "react-icons/pi"; // Purchase
import {BsBriefcase} from "react-icons/bs"; // Production orders
import {MdBolt} from "react-icons/md"; // Finished goods
import Card from "../card/Card";
import useDashboard from "../../services/useDashboard";
import {useQuery} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const Metrics = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    Sales: null,
    purchase: null,
    po: null,
    fg: null,
  });

  const {getTopHeader} = useDashboard();

  const {isLoading: loading, data: headerData} = useQuery({
    queryKey: ["dashboard/top"],
    queryFn: () => getTopHeader(),
  });

  useEffect(() => {
    if (!headerData) return;

    setMetrics({
      Sales: {
        amount: `₹ ${parseFloat(headerData.total_sales || 0).toLocaleString()}`,
        percent: headerData.total_sales_change,
      },
      purchase: {
        amount: `₹ ${parseFloat(headerData.total_purchases || 0).toLocaleString()}`,
        percent: headerData.total_purchases_change,
      },
      po: {
        quantity: headerData.ongoing_production_orders ?? 0,
        percent: headerData.production_order_change,
      },
      fg: {
        quantity: headerData.current_fg_inventory ?? 0,
        percent: null, 
      },
    });
  }, [headerData]);

  const {Sales, purchase, po, fg} = metrics;

  // Navigation functions for each metric card
  const handleSalesClick = () => {
    navigate('/sales');
  };

  const handlePurchaseClick = () => {
    navigate('/purchase');
  };

  const handleProductionClick = () => {
    navigate('/production');
  };

  const handleFinishedGoodsClick = () => {
    navigate('/finished_good');
  };

  if (loading) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
      <Card
        title="Sales"
        icon={HiOutlineArchiveBox}
        value={Sales?.amount}
        percent={Sales?.percent}
        onClick={handleSalesClick}
        className="min-h-[160px] p-6 bg-background text-text shadow-md rounded-xl"
      />
      <Card
        title="Purchase"
        icon={PiCubeDuotone}
        value={purchase?.amount}
        percent={purchase?.percent}
        onClick={handlePurchaseClick}
        className="min-h-[160px] p-6 bg-background text-text shadow-md rounded-xl"
      />
      <Card
        title="PO"
        icon={BsBriefcase}
        value={po?.quantity}
        percent={po?.percent}
        onClick={handleProductionClick}
        className="min-h-[160px] p-6 bg-background text-text shadow-md rounded-xl"
      />
      <Card
        title="Finished Goods"
        icon={MdBolt}
        value={fg?.quantity}
        percent={fg?.percent}
        onClick={handleFinishedGoodsClick}
        className="min-h-[160px] p-6 bg-background text-text shadow-md rounded-xl"
      />
    </div>
  );
};

export default Metrics;

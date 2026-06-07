import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineArchiveBox } from "react-icons/hi2";//sales box
import { PiCubeDuotone } from "react-icons/pi"; //production
import { BsBriefcase } from "react-icons/bs";

import Card from '../../card/Card';
import useSales from '../../../services/useSales';

const Metrics = ()=>{
    const [metrics, setMetrics] = useState({
       TotalSales: null,
       Outstandings: null,
       OverduePayments:null,
    });
    const {getTopStats} = useSales();
    const {isLoading: loading, data: headerData} = useQuery({
        queryKey: ["sales/top"],
        queryFn: () => getTopStats(),
    });
      useEffect(() => {
        if (!headerData) return;
    
        setMetrics({
          TotalSales: {
            amount: `₹ ${parseFloat(headerData.total_sales || 0).toLocaleString()}`,
            percent: headerData.total_sales_change,
          },
          Outstandings: {
            amount: `₹ ${parseFloat(headerData.total_outstanding_amount || 0).toLocaleString()}`,
            percent: headerData.total_outstanding_change,
          },
          OverduePayments: {
            quantity: headerData.due_payment_count ?? 0,
            percent: headerData.due_payment_change,
          },
        });
      }, [headerData]);

      const {TotalSales,Outstandings,OverduePayments}=metrics;
    return (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 ">
        <Card
            title="Total Sales"
            icon={HiOutlineArchiveBox}
            value={TotalSales?.amount}
            percent={TotalSales?.percent}
            className="min-h-[160px] p-6 bg-background text-text shadow-md rounded-xl"
        />
        <Card
            title="Outstanding"
            icon={PiCubeDuotone}
            value={Outstandings?.amount}
            percent={TotalSales?.percent}
            className="min-h-[160px] p-6 bg-background text-text shadow-md rounded-xl"
        />
        <Card
            title="Due Payments"
            icon={BsBriefcase}
            value={OverduePayments?.quantity}
            percent={TotalSales?.percent}
            className="min-h-[160px] p-6 bg-background text-text shadow-md rounded-xl"
        />
        </div>
    );
}

export default Metrics

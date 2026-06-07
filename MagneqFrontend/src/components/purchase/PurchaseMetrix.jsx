import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import usePurchase from '../../services/usePurchase';
import { HiOutlineArchiveBox } from "react-icons/hi2";
import { PiCubeDuotone } from "react-icons/pi";
import { BsBriefcase } from "react-icons/bs";

import Card from '../card/Card';

const PurchaseMetrics = () => {
  const { getPurchaseStats } = usePurchase();
  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ['Purchases'],
    queryFn: getPurchaseStats,
    onError: () => toast.error('Failed to load purchase metrics'),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <p className="text-center text-text">Loading metrics...</p>;
  if (isError) return <p className="text-center text-red-500">Failed to load metrics.</p>;

  const {
    total_purchases,
    total_purchases_change,
    total_payable_amount,
    pending_orders,
    pending_orders_change,
    total_payable_amount_change,
  } = metrics;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Card
        title="Total Purchase Amount"
        icon={HiOutlineArchiveBox}
        value={`₹ ${parseFloat(total_purchases).toLocaleString()}`}
        percent={total_purchases_change}
        className="min-h-[160px] p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg rounded-xl transition-transform hover:scale-105"
      />
      <Card
        title="Total Payable Amount"
        icon={PiCubeDuotone}
        value={`₹ ${parseFloat(total_payable_amount).toLocaleString()}`}
        percent={total_payable_amount_change}
        className="min-h-[160px] p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg rounded-xl transition-transform hover:scale-105"
      />
      <Card
        title="Pending Purchase Orders"
        icon={BsBriefcase}
        value={pending_orders}
        percent={pending_orders_change}
        className="min-h-[160px] p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg rounded-xl transition-transform hover:scale-105"
      />
    </div>
  );
};

export default PurchaseMetrics;
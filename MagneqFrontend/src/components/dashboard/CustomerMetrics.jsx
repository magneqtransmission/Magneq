import React from "react";
import { HiOutlineArchiveBox } from "react-icons/hi2";
import {
  MdPayments,
  MdOutlineWarningAmber,
  MdOutlineAttachMoney,
} from "react-icons/md";
import Card from "../card/Card";
import useDashboard from "../../services/useDashboard";
import { useQuery } from "@tanstack/react-query";
import { selectAuth } from "../../features/authSlice";
import { useSelector } from "react-redux";

const CustomerMetrics = () => {
  const user = useSelector(selectAuth);
  const userId = user?.user?._id;

  const { getTopCustomerHeader } = useDashboard();

  const { isLoading, data } = useQuery({
    queryKey: ["dashboard/customer/top", userId],
    queryFn: () => getTopCustomerHeader(userId),
    enabled: !!userId,
  });
  console.log(data);

  if (isLoading) return null;
  if (!data) return <p>No customer data found</p>;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      <Card
        title="Total Sales"
        icon={HiOutlineArchiveBox}
        value={`₹ ${parseFloat(data.totalOrderAmount || 0).toLocaleString()}`}
        className="min-h-[160px] p-6 bg-background text-text shadow-md rounded-xl"
      />
      {/* <Card
        title="Total Paid"
        icon={MdPayments}
        value={`₹ ${parseFloat(
          data.totalPaymentReceived || 0
        ).toLocaleString()}`}
        className="min-h-[160px] p-6 bg-background text-text shadow-md rounded-xl"
      /> */}
      <Card
        title="Outstanding Payment"
        icon={MdOutlineWarningAmber}
        value={`₹ ${parseFloat(
          data.totalOutstandingPayment || 0
        ).toLocaleString()}`}
        className="min-h-[160px] p-6 bg-background text-text shadow-md rounded-xl"
      />
      <Card
        title={
          parseFloat(data.totalOverheadPayment || 0) > 0
            ? "Overpaid Amount"
            : "Overdue Payment"
        }
        icon={MdOutlineAttachMoney}
        value={`₹ ${parseFloat(
          data.totalOverheadPayment || 0
        ).toLocaleString()}`}
        className="min-h-[160px] p-6 bg-background text-text shadow-md rounded-xl"
      />
    </div>
  );
};

export default CustomerMetrics;

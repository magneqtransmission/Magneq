// src/components/LedgerDownload.jsx
import React, { forwardRef } from "react";

const LedgerDownload = forwardRef(
  ({ ledgerData, customerData, startDate, endDate }, ref) => {
    if (!ledgerData || !customerData) {
      return <div ref={ref} className="hidden"></div>;
    }

    const { openingBalance, ledgerEntries, closingBalance } = ledgerData;
    const [customerName, customerAddress, customerGst] = customerData.data;

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const getBalance = (balance) => {
      if (balance === null || balance === undefined || balance === "")
        return "";
      return parseFloat(balance).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    return (
      <div
        ref={ref}
        className="w-full p-6 text-[12px] font-sans text-gray-800"
      >
        {/* Company Header */}
        <div className="text-center mb-6">
          <h1 className="m-0 text-lg font-bold">
            MAGNEQ TRANSMISSION PRIVATE LIMITED
          </h1>
          <p className="m-0 text-[11px]">
            PLOT NO.E-24/6, MIDC INDL.AREA, CHIKALTHANA, AURANGABAD
          </p>
        </div>

        {/* Customer Info */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="m-0 text-base font-bold">{customerName}</h2>
            <p className="m-0 text-[12px] font-medium">Ledger Account</p>
            <p className="m-0 text-[10px] text-gray-600">{customerAddress}</p>
            <p className="m-0 text-[10px] text-gray-600">
              GSTIN: {customerGst}
            </p>
          </div>
          <div className="text-right text-[11px] text-gray-700">
            {startDate && endDate
              ? `${formatDate(startDate)} to ${formatDate(endDate)}`
              : ""}
          </div>
        </div>

        {/* Ledger Table */}
        <table className="w-full border border-gray-400 border-collapse text-[11px] print:page-break-inside-auto">
          <thead className="bg-gray-100 print:table-header-group">
            <tr>
              <th className="border border-gray-400 px-2 py-1 text-left font-semibold">
                Date
              </th>
              <th className="border border-gray-400 px-2 py-1 text-left font-semibold">
                Particulars
              </th>
              <th className="border border-gray-400 px-2 py-1 text-left font-semibold">
                Vch Type
              </th>
              <th className="border border-gray-400 px-2 py-1 text-left font-semibold">
                Vch No.
              </th>
              <th className="border border-gray-400 px-2 py-1 text-right font-semibold">
                Debit (₹)
              </th>
              <th className="border border-gray-400 px-2 py-1 text-right font-semibold">
                Credit (₹)
              </th>
            </tr>
          </thead>
          <tbody className="print:table-row-group">
            {/* Opening Balance */}
            <tr className="bg-gray-50">
              <td
                colSpan="5"
                className="border border-gray-300 px-2 py-1 text-right font-semibold"
              >
                Opening Balance
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {getBalance(openingBalance)}
              </td>
            </tr>

            {/* Ledger Entries */}
            {ledgerEntries.map((entry, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } print:page-break-inside-avoid`}
              >
                <td className="border border-gray-300 px-2 py-1">
                  {formatDate(entry.date)}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {entry.particulars}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {entry.vchType || ""}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {entry.vchNo || ""}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right">
                  {entry.debit ? getBalance(entry.debit) : ""}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right">
                  {entry.credit ? getBalance(entry.credit) : ""}
                </td>
              </tr>
            ))}

            {/* Closing Balance */}
            <tr className="bg-gray-50">
              <td
                colSpan="4"
                className="border border-gray-300 px-2 py-1 text-right font-semibold"
              >
                Closing Balance
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {getBalance(closingBalance)}
              </td>
              <td className="border border-gray-300 px-2 py-1"></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
);

export default LedgerDownload;
import React from "react";
import logo from "../../../public/logoBased.js";

const Invoice = ({ invoice }) => {
  if (!invoice?.items?.length) return <div>No invoice data</div>;

  const {
    invoice_number,
    status,
    invoice_date,
    due_date,
    customer,
    sales_order,
    items,
    total_invoice_amount,
  } = invoice;

  // --- Compute Subtotal (before tax) ---
  const subtotal = items.reduce((sum, item) => sum + item.invoiced_amount, 0);

  // --- Compute Tax Summary (group by type) ---
  const taxSummary = items.reduce((acc, item) => {
    item.taxes?.forEach((t) => {
      if (!acc[t.type]) {
        acc[t.type] = { percentage: t.percentage, amount: 0 };
      }
      acc[t.type].amount += t.amount;
    });
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-4xl mx-auto text-sm text-black bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <img src={logo} alt="Company Logo" className="w-24 h-auto" />
        <div className="text-right">
          <h2 className="text-xl font-bold">INVOICE</h2>
          <p><strong>Invoice #:</strong> {invoice_number}</p>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Date:</strong> {invoice_date}</p>
          {due_date && <p><strong>Due Date:</strong> {due_date}</p>}
        </div>
      </div>

      {/* Company Details */}
      <div className="mb-6">
        <p><strong>Company Name:</strong> MAGNEQ TRANSMISSION PRIVATE LIMITED</p>
        <p><strong>Address:</strong> PLOT NO.E-24/6, MIDC INDL.AREA,CHIKALTHANA, Chh. SAMBHAJINAGAR</p>
        <p><strong>Phone:</strong> +91 98765 43210</p>
        <p><strong>GST No:</strong> 27AABCU9603R1ZV</p>
      </div>

      {/* Customer Info */}
      <div className="mb-6">
        <h3 className="font-semibold mb-1">Bill To:</h3>
        <p><strong>Name:</strong> {customer?.name}</p>
        <p><strong>Email:</strong> {customer?.email}</p>
        <p><strong>Phone:</strong> {customer?.phone}</p>
        <p><strong>Address:</strong> {customer?.address}</p>
        <p><strong>State:</strong> {customer?.state}</p>
        <p><strong>Pincode:</strong> {customer?.pincode}</p>
      </div>

      {/* Sales Order Info */}
      {sales_order?.sales_order_number && (
        <div className="mb-6">
          <h3 className="font-semibold mb-1">Sales Order:</h3>
          <p><strong>Order #:</strong> {sales_order.sales_order_number}</p>
        </div>
      )}

      {/* Item Table */}
      <table className="w-full border border-gray-300 mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Sr.</th>
            <th className="border px-2 py-1">Product</th>
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1">Qty</th>
            <th className="border px-2 py-1">Rate</th>
            <th className="border px-2 py-1">Amount</th>
            <th className="border px-2 py-1">Taxes</th>
            <th className="border px-2 py-1">Total w/ Tax</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{idx + 1}</td>
              <td className="border px-2 py-1">
                {item.finished_good?.model || "N/A"} ({item.finished_good?.type})
              </td>
              <td className="border px-2 py-1">{item.description || "-"}</td>
              <td className="border px-2 py-1">{item.invoiced_quantity}</td>
              <td className="border px-2 py-1">₹{item.rate_per_unit.toFixed(2)}</td>
              <td className="border px-2 py-1">₹{item.invoiced_amount.toFixed(2)}</td>
              <td className="border px-2 py-1">
                {item.taxes?.length ? (
                  <ul>
                    {item.taxes.map((t, i) => (
                      <li key={i}>
                        {t.type} ({t.percentage}%): ₹{t.amount.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : "—"}
              </td>
              <td className="border px-2 py-1">₹{item.total_with_tax.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Subtotal + Tax Summary + Grand Total */}
      <div className="text-right space-y-1">
        <p><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</p>

        {Object.entries(taxSummary).map(([type, { percentage, amount }], idx) => (
          <p key={idx}>
            <strong>{type} ({percentage}%):</strong> ₹{amount.toFixed(2)}
          </p>
        ))}

        <p className="font-semibold text-lg mt-2">
          Grand Total: ₹{total_invoice_amount.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default Invoice;

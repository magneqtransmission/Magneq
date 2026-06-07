import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Button from "../../../components/buttons/Button";
import Input from "../../../components/forms/Input";
import Label from "../../../components/forms/Label";
import DatePicker from "../../../components/common/DatePicker";
import OrderNameInput from "../../../components/sales/OrderInputName";

import UnitsUpdateConfirmDialog from "../../../components/common/UnitsUpdateConfirmDialog";
import useLedger from "../../../services/useLedger";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { format } from "date-fns";

const CustomerOpeningBalance = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getLedgerDateRange, createOpeningBalance } = useLedger();

  const [customer, setCustomer] = useState(null);
  const [customerName, setCustomerName] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [creditAmount, setCreditAmount] = useState("");
  const [debitAmount, setDebitAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const [previousBalance, setPreviousBalance] = useState(0);
  const [dateRange, setDateRange] = useState({ firstDate: null, lastDate: null, hasEntries: false });

  // Fetch date range when customer is selected
  const { data: dateRangeData, isLoading: isLoadingDateRange } = useQuery({
    queryKey: ["ledgerDateRange", customer?.id],
    queryFn: () => getLedgerDateRange(customer?.id),
    enabled: !!customer?.id,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache the result
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    onSuccess: (data) => {
        if (data) {
            setDateRange({
                firstDate: data.firstDate ? new Date(data.firstDate) : null,
                lastDate: data.lastDate ? new Date(data.lastDate) : null,
                hasEntries: data.hasEntries || false,
            });
        }
    },
  });

  // Calculate previous balance based on date
  useEffect(() => {
    const calculatePreviousBalance = async () => {
      if (!customer?.id || !date) {
        setPreviousBalance(0);
        return;
      }

      const entryDate = new Date(date);
      entryDate.setHours(0, 0, 0, 0);

      if (dateRangeData?.hasEntries) {
        const firstDate = dateRangeData?.firstDate ? new Date(dateRangeData.firstDate) : null;
        const lastDate = dateRangeData?.lastDate ? new Date(dateRangeData.lastDate) : null;

        if (firstDate) {
          firstDate.setHours(0, 0, 0, 0);
        }
        if (lastDate) {
          lastDate.setHours(23, 59, 59, 999);
        }

        if (firstDate && entryDate < firstDate) {
          // Entry is before first entry, balance starts from 0
          setPreviousBalance(0);
        } else if (lastDate && entryDate > lastDate) {
          // Entry is after last entry, we'll fetch the last running balance from backend
          // For now, set to 0 - backend will calculate it correctly
          setPreviousBalance(0);
        } else {
          setPreviousBalance(0);
        }
      } else {
        // No entries exist, balance starts from 0
        setPreviousBalance(0);
      }
    };

    calculatePreviousBalance();
  }, [customer?.id, date, dateRangeData]);

  const handleTypeToggle = (type) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleCustomerSelect = (customerInfo) => {
    setCustomer(customerInfo);
    setCustomerName(customerInfo);
  };

  // Function to check if a date should be disabled
  const isDateDisabled = (date) => {
    if (!date) return true;

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Get today's date (end of day)
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Always disable future dates
    if (checkDate > today) {
      return true;
    }

    // If no entries exist, allow any date (but not future)
    if (!dateRangeData?.hasEntries) {
      return false;
    }

    const firstDate = dateRangeData?.firstDate ? new Date(dateRangeData.firstDate) : null;
    const lastDate = dateRangeData?.lastDate ? new Date(dateRangeData.lastDate) : null;

    if (firstDate) {
      firstDate.setHours(0, 0, 0, 0);
    }
    if (lastDate) {
      lastDate.setHours(23, 59, 59, 999);
    }

    // If entries exist, disable dates between first and last entry (inclusive)
    if (firstDate && lastDate) {
      if (checkDate >= firstDate && checkDate <= lastDate) {
        return true; // Disable dates in the range
      }
      // Allow dates before first entry or after last entry (but not future)
      return false;
    } else if (firstDate && !lastDate) {
      // Only first entry exists
      if (checkDate >= firstDate) {
        return true; // Disable dates on or after first entry
      }
      return false;
    }

    return false;
  };

  const isFormValid = () => {
    return (
      customer?.id &&
      date &&
      description &&
      selectedTypes.length > 0 &&
      ((selectedTypes.includes("CREDIT") && creditAmount && parseFloat(creditAmount) > 0) ||
        (selectedTypes.includes("DEBIT") && debitAmount && parseFloat(debitAmount) > 0))
    );
  };

  const createOpeningBalanceMutation = useMutation({
    mutationFn: (data) => createOpeningBalance(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["ledgerDateRange", customer?.id]);
      toast.success("Opening balance created successfully");
      navigate("/manage_customers");
    },
    onError: (error) => {
      console.error("Error creating opening balance:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Error creating opening balance";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = () => {
    if (!isFormValid()) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate date
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);

    // Get today's date (end of day)
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Validate: entry date cannot be in the future
    if (entryDate > today) {
      toast.error("Entry date cannot be in the future");
      return;
    }

    // Validate date range if entries exist
    if (dateRangeData?.hasEntries) {
      const firstDate = dateRangeData?.firstDate ? new Date(dateRangeData.firstDate) : null;
      const lastDate = dateRangeData?.lastDate ? new Date(dateRangeData.lastDate) : null;

      if (firstDate) {
        firstDate.setHours(0, 0, 0, 0);
      }
      if (lastDate) {
        lastDate.setHours(23, 59, 59, 999);
      }

      // Entry date must be:
      // 1. Before first entry (and <= today), OR
      // 2. After last entry BUT <= today
      // Disallow: between first and last entry (inclusive)
      if (firstDate && lastDate) {
        if (entryDate >= firstDate && entryDate <= lastDate) {
          toast.error(
            `Entry date must be before ${format(firstDate, "dd-MM-yyyy")} or after ${format(lastDate, "dd-MM-yyyy")} (but not in the future)`
          );
          return;
        }
        // If entry is after last date, it must be <= today
        if (entryDate > lastDate && entryDate > today) {
          toast.error(
            `Entry date after ${format(lastDate, "dd-MM-yyyy")} must be today or earlier`
          );
          return;
        }
      } else if (firstDate && !lastDate) {
        // Only first entry exists
        if (entryDate >= firstDate) {
          toast.error(`Entry date must be before ${format(firstDate, "dd-MM-yyyy")}`);
          return;
        }
      }
    }

    // Calculate total change
    const credit = selectedTypes.includes("CREDIT") ? parseFloat(creditAmount || 0) : 0;
    const debit = selectedTypes.includes("DEBIT") ? parseFloat(debitAmount || 0) : 0;
    const totalChange = debit - credit;
    const newBalance = previousBalance + totalChange;

    setPendingSubmission({
      creditAmount: credit,
      debitAmount: debit,
      totalChange,
      newBalance,
    });
    setShowConfirmDialog(true);
  };

  const handleConfirmDialog = (action) => {
    if (!pendingSubmission) return;

    const { creditAmount: credit, debitAmount: debit } = pendingSubmission;

    // For opening balance, we always set as final (action "set")
    // The dialog is shown for consistency but we always use the entered values
    createOpeningBalanceMutation.mutate({
      customerId: customer.id,
      date,
      creditAmount: credit > 0 ? credit : undefined,
      debitAmount: debit > 0 ? debit : undefined,
      description,
    });

    setPendingSubmission(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/manage_customers")}>
            <HiOutlineArrowLeft className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Customer Opening Balance
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
          {/* Customer Selection */}
          <div>
            <Label className="text-lg font-semibold mb-2">Customer Name</Label>
            <OrderNameInput
              customerName={customerName}
              setCustomerName={handleCustomerSelect}
              setCustomer={handleCustomerSelect}
            />
          </div>

          {/* Date Range Info */}
          {customer?.id && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Ledger Date Range</h3>
              {isLoadingDateRange ? (
                <p className="text-sm text-blue-800 dark:text-blue-200">Loading date range...</p>
              ) : dateRangeData?.hasEntries ? (
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <p>
                    <strong>First Entry:</strong>{" "}
                    {dateRangeData?.firstDate ? format(new Date(dateRangeData.firstDate), "dd-MM-yyyy") : "N/A"}
                  </p>
                  <p>
                    <strong>Last Entry:</strong>{" "}
                    {dateRangeData?.lastDate ? format(new Date(dateRangeData.lastDate), "dd-MM-yyyy") : "N/A"}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                    Entry date must be before the first entry (and before today) or after the last entry (but not in the future).
                  </p>
                </div>
              ) : (
                <p className="text-sm text-blue-800 dark:text-blue-200">No ledger entries exist for this customer. You can create the first entry.</p>
              )}
            </div>
          )}

          {/* Date Selection */}
          <div>
            <Label htmlFor="date" className="text-lg font-semibold mb-2">
              Entry Date
            </Label>
            <DatePicker
              value={date}
              onChange={(value) => setDate(value)}
              placeholder="Select entry date"
              maxDate={new Date()} // Prevent selecting future dates
              isDateDisabled={isDateDisabled}
              className="w-full"
            />
          </div>

          {/* Type Selection */}
          <div>
            <Label className="text-lg font-semibold mb-2">Transaction Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes("CREDIT")}
                  onChange={() => handleTypeToggle("CREDIT")}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Credit</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes("DEBIT")}
                  onChange={() => handleTypeToggle("DEBIT")}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Debit</span>
              </label>
            </div>
          </div>

          {/* Credit Amount */}
          {selectedTypes.includes("CREDIT") && (
            <div>
              <Label htmlFor="creditAmount" className="text-lg font-semibold mb-2">
                Credit Amount
              </Label>
              <Input
                id="creditAmount"
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="Enter credit amount"
                min="0"
                step="0.01"
                className="w-full"
              />
            </div>
          )}

          {/* Debit Amount */}
          {selectedTypes.includes("DEBIT") && (
            <div>
              <Label htmlFor="debitAmount" className="text-lg font-semibold mb-2">
                Debit Amount
              </Label>
              <Input
                id="debitAmount"
                type="number"
                value={debitAmount}
                onChange={(e) => setDebitAmount(e.target.value)}
                placeholder="Enter debit amount"
                min="0"
                step="0.01"
                className="w-full"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-lg font-semibold mb-2">
              Description
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Previous Balance Display */}
          {customer?.id && date && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Previous Balance</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ₹{previousBalance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Balance before this entry
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isFormValid() || createOpeningBalanceMutation.isPending}
            loading={createOpeningBalanceMutation.isPending}
            className="w-full"
          >
            Create Opening Balance
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {pendingSubmission && (
        <UnitsUpdateConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false);
            setPendingSubmission(null);
          }}
          onConfirm={handleConfirmDialog}
          previousQty={previousBalance}
          enteredQty={Math.abs(pendingSubmission.totalChange)}
          modelNumber={customer?.name || "Customer"}
        />
      )}
    </div>
  );
};

export default CustomerOpeningBalance;


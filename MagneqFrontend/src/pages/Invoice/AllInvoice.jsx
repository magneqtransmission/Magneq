import React, {useState, useRef, useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import DaynamicTable from "../../components/common/Table";
import {useNavigate} from "react-router-dom";
import {useSearch} from "../../context/SearchbarContext";
import Badge from "../../components/common/Badge";
import useInvoice from "../../services/useInvoice";
import Pagination from "../../components/common/Pagination";
import Button from "../../components/buttons/Button";
import Input from "../../components/forms/Input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/datepicker.css";
import {FiFilter, FiX, FiCalendar} from "react-icons/fi";
import {selectAuth} from "../../features/authSlice";
import {HiOutlineArchiveBox} from "react-icons/hi2";
import {PiCubeDuotone} from "react-icons/pi";

const AllInvoice = () => {
  const navigate = useNavigate();
  const {getAllInvoices} = useInvoice();
  const [page, setPage] = useState(1);
  const {searchQuery} = useSearch();

  // Get user info from Redux store
  const auth = useSelector(selectAuth);
  const isSales = auth?.route?.role === "SALES";
  const user = auth?.user;
  const customerId = user?._id;
  const isCustomer = auth?.route?.role === "CUSTOMER";

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [localSearch, setLocalSearch] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({});

  const filterRef = useRef(null);

  // Close filters on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilters(false);
      }
    };
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  // Use local search if available, otherwise use global search
  const currentSearch = localSearch || searchQuery;

  // Convert dates to string format for API
  const startDateString = startDate
    ? startDate.toISOString().split("T")[0]
    : "";
  const endDateString = endDate ? endDate.toISOString().split("T")[0] : "";

  const {data, isLoading, isError} = useQuery({
    queryKey: [
      "AllInvoices",
      page,
      currentSearch,
      startDateString,
      endDateString,
      customerId,
      user?._id,
      user?.role,
    ],
    queryFn: () =>
      getAllInvoices(
        page,
        currentSearch,
        isCustomer ? customerId : null,
        startDateString,
        endDateString,
        user?._id,
        user?.role
      ),
    staleTime: 5 * 60 * 1000,
  });

  const formatCell = (cell, idx) => {
    if (
      idx === 1 &&
      typeof cell === "string" &&
      /^\d{4}-\d{2}-\d{2}T/.test(cell)
    ) {
      return new Date(cell).toLocaleDateString();
    }

    if (idx === 3 && Array.isArray(cell)) {
      return (
        <div className="flex flex-wrap gap-2">
          {cell.map((entry, i) => (
            <div
              key={i}
              className="bg-background text-text text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
            >
              {entry.split("/").join(" | ")}
            </div>
          ))}
        </div>
      );
    }

    if (idx === 4) {
      const status = cell;
      let color = "primary";
      let label = status;
      if (status === "Unapproved") {
        color = "danger";
        label = "Unapproved";
      } else if (status === "INPROCESS") {
        color = "warning";
        label = "In Process";
      } else if (status === "UNPROCESSED") {
        color = "warning";
        label = "Unprocessed";
      } else if (status === "PROCESSED") {
        color = "success";
        label = "Processed";
      }
      return (
        <Badge size="sm" color={color}>
          {label}
        </Badge>
      );
    }

    return cell ?? "—";
  };

  const handlePageChange = (newPage) => {
    setPage(parseInt(newPage));
  };

  const handleRowClick = (row) => {
    navigate(`/invoice/${row.item_id}`);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: localSearch,
      startDate: startDateString,
      endDate: endDateString,
    });
    setPage(1); // Reset to first page when applying filters
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setLocalSearch("");
    setStartDate(null);
    setEndDate(null);
    setAppliedFilters({});
    setPage(1);
  };

  const hasActiveFilters = localSearch || startDate || endDate;

  if (isLoading) return <p className="text-center py-4">Loading invoices...</p>;
  if (isError)
    return (
      <p className="text-center py-4 text-red-500">Error loading invoices</p>
    );

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-0 mb-6">
        {/* Date Range Display */}
        {(startDate || endDate) && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Date Range:
                  {startDate && (
                    <span className="ml-1">
                      {startDate.toLocaleDateString()}
                    </span>
                  )}
                  {startDate && endDate && (
                    <span className="mx-2 text-blue-600 dark:text-blue-400">
                      to
                    </span>
                  )}
                  {endDate && <span>{endDate.toLocaleDateString()}</span>}
                  {startDate && !endDate && (
                    <span className="ml-1 text-blue-600 dark:text-blue-400">
                      onwards
                    </span>
                  )}
                </span>
              </div>
              <Button
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
                variant="ghost"
                size="sm"
                startIcon={<FiX />}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Clear Dates
              </Button>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 sm:min-w-[300px]">
                <Input
                  type="text"
                  placeholder="Search by invoice number or customer name..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pr-10"
                />
              </div>

              {/* Filter Toggle Button */}
              <div className="relative" ref={filterRef}>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant={hasActiveFilters ? "primary" : "outline"}
                  startIcon={<FiFilter />}
                  className="whitespace-nowrap"
                >
                  Filters{" "}
                  {hasActiveFilters &&
                    `(${Object.values(appliedFilters).filter(Boolean).length})`}
                </Button>

                {/* Filter Dropdown */}
                {showFilters && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Filter Invoices
                        </h3>
                        <Button
                          onClick={() => setShowFilters(false)}
                          variant="ghost"
                          size="sm"
                          startIcon={<FiX />}
                        />
                      </div>

                      {/* Date Range Filters */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <FiCalendar className="inline mr-1" />
                              Start Date
                            </label>
                            <DatePicker
                              selected={startDate}
                              onChange={(date) => {
                                setStartDate(date);
                                // If end date is before new start date, clear it
                                if (endDate && date && date > endDate) {
                                  setEndDate(null);
                                }
                              }}
                              placeholderText="Select start date"
                              maxDate={endDate || new Date()}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              dateFormat="MM/dd/yyyy"
                              showPopperArrow={false}
                              popperClassName="react-datepicker-popper"
                            />
                            {startDate && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                From: {startDate.toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              <FiCalendar className="inline mr-1" />
                              End Date
                            </label>
                            <DatePicker
                              selected={endDate}
                              onChange={(date) => setEndDate(date)}
                              placeholderText="Select end date"
                              minDate={startDate || undefined}
                              maxDate={new Date()}
                              disabled={!startDate}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              dateFormat="MM/dd/yyyy"
                              showPopperArrow={false}
                              popperClassName="react-datepicker-popper"
                            />
                            {endDate && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                To: {endDate.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quick Date Range Buttons */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Quick Select
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const today = new Date();
                                setStartDate(today);
                                setEndDate(today);
                              }}
                              className="text-xs"
                            >
                              Today
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const today = new Date();
                                const yesterday = new Date(today);
                                yesterday.setDate(yesterday.getDate() - 1);
                                setStartDate(yesterday);
                                setEndDate(yesterday);
                              }}
                              className="text-xs"
                            >
                              Yesterday
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const today = new Date();
                                const weekAgo = new Date(today);
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                setStartDate(weekAgo);
                                setEndDate(today);
                              }}
                              className="text-xs"
                            >
                              Last 7 Days
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const today = new Date();
                                const monthAgo = new Date(today);
                                monthAgo.setDate(monthAgo.getDate() - 30);
                                setStartDate(monthAgo);
                                setEndDate(today);
                              }}
                              className="text-xs"
                            >
                              Last 30 Days
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const today = new Date();
                                const firstDayOfMonth = new Date(
                                  today.getFullYear(),
                                  today.getMonth(),
                                  1
                                );
                                setStartDate(firstDayOfMonth);
                                setEndDate(today);
                              }}
                              className="text-xs"
                            >
                              This Month
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const today = new Date();
                                const firstDayOfYear = new Date(
                                  today.getFullYear(),
                                  0,
                                  1
                                );
                                setStartDate(firstDayOfYear);
                                setEndDate(today);
                              }}
                              className="text-xs"
                            >
                              This Year
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Filter Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={handleApplyFilters}
                          variant="primary"
                          size="sm"
                          className="flex-1"
                        >
                          Apply Filters
                        </Button>
                        <Button
                          onClick={handleClearFilters}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {data && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {data.item?.length || 0} of {data.total_items || 0} invoices
            {hasActiveFilters && " (filtered)"}
          </div>
        )}
        {!(isCustomer || isSales) && (
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              onClick={() => navigate("/invoice/create")}
              type="button"
              size="md"
              variant="primary"
              startIcon={<HiOutlineArchiveBox />}
              className="w-full sm:w-auto shadow-theme-xs"
            >
              Add Invoice
            </Button>
            <Button
              onClick={() => navigate("/ledger")}
              type="button"
              size="md"
              variant="primary"
              startIcon={<HiOutlineArchiveBox />}
              className="w-full sm:w-auto shadow-theme-xs"
            >
              View Ledger
            </Button>
            <Button
              type="button"
              size="md"
              variant="primary"
              startIcon={<PiCubeDuotone />}
              onClick={() => navigate("/payment")}
            >
              Add Payment
            </Button>
            <Button
              type="button"
              size="md"
              variant="primary"
              startIcon={<PiCubeDuotone />}
              onClick={() => navigate("/invoice/export")}
            >
              Export
            </Button>
          </div>
        )}
      </div>

      <DaynamicTable
        header={data.header}
        tableData={{item: data.item}}
        formatCell={formatCell}
        onRowClick={handleRowClick}
      />

      {/* ✅ Always show pagination if there are pages */}
      {data?.total_pages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={data.total_pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AllInvoice;

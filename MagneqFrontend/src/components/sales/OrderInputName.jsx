import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import useManage from "../../services/useManage";
import Label from "../forms/Label";
import Input from "../forms/Input";

const OrderNameInput = ({ wantHidden,repName, setRepName, customerName, setCustomerName, setCustomer = (temp) => { } }) => {
  const user = useSelector((state) => state.auth.route);
  const role = user?.role || "default";

  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page] = useState(1);
  const { getAllCustomers } = useManage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debounce the search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, debouncedQuery],
    queryFn: () => getAllCustomers({ page, limit: 20, search: debouncedQuery }),
    enabled: !!debouncedQuery,
    staleTime: 5 * 60 * 1000,
  });

  // Fixed handleSelect function
  const handleSelect = (customerData) => {
    console.log(customerData)
    const customerInfo = {
      id: customerData.id,
      name: customerData.data[0], // or whichever field is display name
      data:customerData.data
    };
    
    // Set the customer data properly
    setCustomer(customerInfo);
    
    // Call setCustomerName with the customerInfo object (not just the name)
    setCustomerName(customerInfo);
    
    // Update search input with display name
    setSearchInput(customerData.data[0]);
    setIsDropdownOpen(false);
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (role !== "ADMIN" || role !== "DEVELOPER") {
    return (
      <div className="space-y-4 flex gap-15">
        <div>
          <Label htmlFor="repName" className="text-md font-medium mb-2">Executive Name</Label>
          <Input
            id="repName"
            name="repName"
            placeholder="Raj Sharma"
            type="text"
            value={repName}
            className="max-w-150 border-0 border-gray-600"
            onChange={(e) => setRepName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="customerName" className="text-md font-medium mb-2">Customer Name</Label>
          <Input
            id="customerSearch"
            name="customerSearch"
            value={searchInput}
            placeholder="Search customer..."
            className="mb-1  bg-white dark:bg-gray-900"
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {isDropdownOpen && (
            <ul className="absolute z-10 w-fit  bg-white dark:bg-gray-900 border border-gray-300 max-h-60 overflow-y-auto shadow-md rounded-md mt-1">
              {isLoading ? (
                <li className="px-4 py-2 text-text">Loading...</li>
              ) : data && data.item.length > 0 ? (
                data.item.map((customer) => (
                  <li
                    key={customer.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer "
                    onClick={() => handleSelect(customer)}
                  >
                    {customer.data[0]}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-text  bg-white dark:bg-gray-900">No customers found</li>
              )}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md space-y-2 bg-background" ref={dropdownRef}>
      <Label htmlFor="customerSearch" className="text-xl font-medium">Customer Name</Label>
      <Input
        id="customerSearch"
        name="customerSearch"
        value={searchInput}
        placeholder="Search customer..."
        className="mb-1 bg-background"
        onFocus={() => setIsDropdownOpen(true)}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      {isDropdownOpen && (
        <ul className="absolute z-10 w-full bg-white dark:bg-gray-900 border border-gray-300 max-h-60 overflow-y-auto shadow-md rounded-md mt-1">
          {isLoading ? (
            <li className="px-4 py-2 text-gray-500">Loading...</li>
          ) : data && data.item.length > 0 ? (
            data.item.map((customer) => (
              <li
                key={customer.id}
                className="px-4 py-2 hover:bg-hover cursor-pointer bg-white dark:bg-gray-900"
                onClick={() => handleSelect(customer)}
              >
                {customer.data[0]}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-text">No customers found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default OrderNameInput;
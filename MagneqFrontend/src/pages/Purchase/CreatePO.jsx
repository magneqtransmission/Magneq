import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/buttons/Button";
import Label from "../../components/forms/Label";
import Input from "../../components/forms/Input";
import SuccessModal from "../../components/common/SuccessModal";
import useRawMaterials from "../../services/useRawMaterials";
import usePurchase from "../../services/usePurchase";
import POTable from "./POTable";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useManage from "../../services/useManage";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreatePO = () => {
  const navigate = useNavigate();
  const { getRawMaterialFilterConfig, getFilteredRawMaterials } =
    useRawMaterials();
  const { createPurchaseOrder } = usePurchase();
  const { getAllVendors } = useManage();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [quantities, setQuantities] = useState({});
  const [pricesPerType, setPricesPerType] = useState({});
  const [classType, setClassType] = useState("A");
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [typeOptions, setTypeOptions] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);
  const [rawMaterialOptions, setRawMaterialOptions] = useState([]);
  const [selectedRawMaterialId, setSelectedRawMaterialId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [tableItems, setTableItems] = useState([]);
  const [vendorName, setVendorName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [filterConfig, setFilterConfig] = useState(null);
  const modalTimeoutRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelect = (value) => {
    setVendorName(value);
    setSearchInput(value);
    setIsDropdownOpen(false);
  };
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 50);
    return () => clearTimeout(timeout);
  }, [searchInput]);
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

  const { data, isLoading } = useQuery({
    queryKey: ["vendors", debouncedQuery],
    queryFn: () => getAllVendors({ limit: 20, search: debouncedQuery }),
    enabled: !!debouncedQuery,
    staleTime: 5 * 60 * 1000,
  });
  const { mutate: createPO, isPending } = useMutation({
    mutationFn: (order) => createPurchaseOrder(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Purchases"] });
      queryClient.invalidateQueries({ queryKey: ["POItems"] });
      setTableItems([]);
      setVendorName("");
      setPurchaseDate("");
      toast.success("Purchase Order Created Successfully");
      navigate("/purchase");
    },
    onError: (err) => {
      console.error("Order creation failed:", err);
      toast.error("Failed to create order. Please try again.");
    },
  });
  useEffect(() => {
    const fetchConfig = async () => {
      const res = await getRawMaterialFilterConfig();
      setFilterConfig(res?.data || res);
    };
    fetchConfig();

    return () => {
      if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setType("");
    setName("");
    setRawMaterialOptions([]);
    setSelectedRawMaterialId("");
    setSelectedTypes([]);

    if (!filterConfig) return;

    if (classType === "A") {
      setTypeOptions(filterConfig.A.types || []);
      setNameOptions(filterConfig.A.names || []);
    } else if (classType === "B") {
      setTypeOptions(filterConfig.B.types || []);
      setNameOptions([]);
    } else if (classType === "C") {
      setNameOptions(filterConfig.C.names || []);
      setTypeOptions([]);
    }
  }, [classType, filterConfig]);

  useEffect(() => {
    if (classType === "B" && type) {
      getFilteredRawMaterials({ class_type: "B", type }).then((res) => {
        const names = (res?.data || res)?.map((rm) => rm.name).filter(Boolean);
        setNameOptions(names);
      });
    }
    if (classType === "B" && !type) {
      setNameOptions([]);
      setName("");
    }
  }, [classType, type]);

  useEffect(() => {
    if (classType === "C" && name) {
      getFilteredRawMaterials({ class_type: "C", name }).then((res) => {
        const types = Array.from(
          new Set((res?.data || res).map((rm) => rm.type).filter(Boolean))
        );
        setTypeOptions(types);
        setSelectedTypes([]); // Reset selected types
      });
    }
    if (classType === "C" && !name) {
      setTypeOptions([]);
      setSelectedTypes([]);
    }
  }, [classType, name]);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (classType === "A" && type && name) {
        const res = await getFilteredRawMaterials({
          class_type: "A",
          type,
          name,
        });
        const data = res?.data || res;
        setRawMaterialOptions(data);
        setSelectedRawMaterialId(data?.[0]?._id || "");
      } else if (classType === "B" && type && name) {
        const res = await getFilteredRawMaterials({
          class_type: "B",
          type,
          name,
        });
        const data = res?.data || res;
        setRawMaterialOptions(data);
        setSelectedRawMaterialId(data?.[0]?._id || "");
      } else if (classType === "C" && name && selectedTypes.length > 0) {
        try {
          const allResults = await Promise.all(
            selectedTypes.map((typeVal) =>
              getFilteredRawMaterials({ class_type: "C", name, type: typeVal })
            )
          );
          const merged = allResults
            .flat()
            .map((res) => res?.data || res)
            .flat();
          const unique = Array.from(
            new Map(merged.map((m) => [m._id, m])).values()
          );

          setRawMaterialOptions(unique);
          setSelectedRawMaterialId(unique?.[0]?._id || "");
        } catch (err) {
          console.error("Failed to fetch materials for selected types", err);
        }
      } else {
        setRawMaterialOptions([]);
        setSelectedRawMaterialId("");
      }
    };

    fetchMaterials();
  }, [classType, type, name, selectedTypes]);

  const handleTypeToggle = (typeValue) => {
    setSelectedTypes((prev) =>
      prev.includes(typeValue)
        ? prev.filter((t) => t !== typeValue)
        : [...prev, typeValue]
    );
  };

  const handleAddItem = async () => {
    setError("");

    if (classType === "C") {
      if (!name || selectedTypes.length === 0) {
        setError("Please select a name and at least one type.");
        return;
      }

      try {
        const allMaterials = [];
        let missingInput = false;

        for (const type of selectedTypes) {
          const res = await getFilteredRawMaterials({
            class_type: "C",
            name,
            type,
          });

          const data = res?.data || res;
          const quantityVal = Number(quantities[type] || 0);
          const priceVal = Number(pricesPerType[type] || 0);

          if (!quantityVal || !priceVal) {
            missingInput = true;
            toast.error(`Please enter quantity and price for type: ${type}`);
            continue;
          }

          allMaterials.push(
            ...data.map((material) => ({
              raw_material_id: material._id,
              name: material.name,
              class_type: material.class_type,
              type: material.type,
              quantity: quantityVal,
              price_per_unit: priceVal,
              rawMaterial: material,
            }))
          );
        }

        if (missingInput) return;

        if (allMaterials.length === 0) {
          setError("No materials found for the selected types.");
          return;
        }

        setTableItems((prev) => {
          const updated = [...prev];
          allMaterials.forEach((newMat) => {
            const idx = updated.findIndex(
              (item) => String(item.raw_material_id) === String(newMat.raw_material_id)
            );
            if (idx !== -1) {
              updated[idx] = {
                ...updated[idx],
                quantity: updated[idx].quantity + newMat.quantity,
                price_per_unit: newMat.price_per_unit,
              };
            } else {
              updated.push(newMat);
            }
          });
          return updated;
        });
        setSelectedTypes([]);
        setQuantities({});
        setPricesPerType({});
        setName("");
        setPrice("");
      } catch (err) {
        console.error("Error fetching raw materials for Class C:", err);
        setError("Failed to fetch materials. Please try again.");
      }

      return;
    }

    if (!selectedRawMaterialId || !quantity || !price) {
      setError("Please select a material, quantity, and price.");
      return;
    }

    const material = rawMaterialOptions.find(
      (m) => String(m._id) === String(selectedRawMaterialId)
    );

    if (!material) {
      setError("Selected material not found in options.");
      return;
    }

    setTableItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => String(item.raw_material_id) === String(material._id)
      );
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + Number(quantity),
          price_per_unit: Number(price),
        };
        return updated;
      }
      return [
        ...prev,
        {
          raw_material_id: material._id,
          name: material.name,
          class_type: material.class_type,
          type: material.type,
          quantity: Number(quantity),
          price_per_unit: Number(price),
          rawMaterial: material,
        },
      ];
    });

    setSelectedRawMaterialId("");
    setQuantity(1);
    setPrice("");
  };

  const handleDelete = (idx) => {
    setTableItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreatePO = async () => {
    setError("");

    if (!vendorName || !purchaseDate) {
      setError("Vendor name and purchase date are required.");
      return;
    }

    if (tableItems.length === 0) {
      setError("No items to create PO.");
      return;
    }

    try {
      const payload = {
        vendor_name: vendorName,
        purchasing_date: purchaseDate ? purchaseDate.toISOString().split("T")[0] : "",
        items: tableItems.map(
          ({ raw_material_id, quantity, price_per_unit }) => ({
            raw_material_id,
            quantity,
            price_per_unit,
          })
        ),
      };
      createPO(payload);
    } catch {
      setError("Failed to create PO. Please try again.");
    }
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Create Purchase Order
          </h2>
        </div>

        {/* Vendor Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div ref={dropdownRef} className="relative">
            <Label htmlFor="vendorName" className="text-sm font-medium mb-1">
              Vendor Name
            </Label>
            <Input
              id="vendorSearch"
              name="vendorSearch"
              value={searchInput}
              placeholder="Search Vendor..."
              className="w-full"
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {isDropdownOpen && (
              <ul className="absolute z-10 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 max-h-60 overflow-y-auto shadow-lg rounded-md mt-1">
                {isLoading ? (
                  <li className="px-4 py-2 text-gray-500">Loading...</li>
                ) : data && data.item && data.item.length > 0 ? (
                  data.item.map((vendor) => (
                    <li
                      key={vendor.id}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200"
                      onClick={() => handleSelect(vendor.data[0])}
                    >
                      {vendor.data[0]}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500">No Vendor found</li>
                )}
              </ul>
            )}
          </div>
          <div className="relative">
            <Label className="block text-sm font-medium mb-1">
              Purchase Date
            </Label>
            <DatePicker
              selected={purchaseDate}
              onChange={(date) => setPurchaseDate(date)}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select a date"
              className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Material Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
          <div>
            <Label className="block text-sm font-medium mb-1">Class</Label>
            <select
              value={classType}
              onChange={(e) => setClassType(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          {(classType === "A" || classType === "B") && (
            <>
              <div>
                <Label className="block text-sm font-medium mb-1">Type</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Type</option>
                  {typeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-1">Name</Label>
                <select
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Name</option>
                  {nameOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="block text-sm font-medium mb-1">
                  Raw Material
                </Label>
                <select
                  value={selectedRawMaterialId}
                  onChange={(e) => setSelectedRawMaterialId(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={rawMaterialOptions.length === 0}
                >
                  <option value="">Select Raw Material</option>
                  {rawMaterialOptions.map((rm) => {
                    const existingItem = tableItems.find(
                      (item) => String(item.raw_material_id) === String(rm._id)
                    );
                    return (
                      <option key={rm._id} value={rm._id}>
                        {rm.name} ({rm.type})
                        {existingItem ? ` [${existingItem.quantity} in table]` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <Label className="block text-sm font-medium mb-1">
                  Quantity
                </Label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-1">
                  Price per Unit
                </Label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter price"
                />
              </div>
            </>
          )}

          {classType === "C" && (
            <>
              <div className="sm:col-span-2">
                <Label className="block text-sm font-medium mb-1">Name</Label>
                <select
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Name</option>
                  {nameOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 mt-2">
                <Label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Select Types and Enter Details
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                  {typeOptions.map((t) => (
                    <div
                      key={t}
                      className="border border-gray-200 dark:border-gray-600 p-4 rounded-lg shadow-sm"
                    >
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                        <input
                          type="checkbox"
                          value={t}
                          checked={selectedTypes.includes(t)}
                          onChange={() => handleTypeToggle(t)}
                          className="form-checkbox rounded text-primary-500 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-500"
                        />
                        {t}
                      </label>
                      {selectedTypes.includes(t) && (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div>
                            <Label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                              Quantity
                            </Label>
                            <input
                              type="number"
                              min="1"
                              value={quantities[t] || ""}
                              onChange={(e) =>
                                setQuantities((prev) => ({
                                  ...prev,
                                  [t]: Number(e.target.value),
                                }))
                              }
                              className="w-full px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                          <div>
                            <Label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                              Price/Unit
                            </Label>
                            <input
                              type="number"
                              min="0"
                              value={pricesPerType[t] || ""}
                              onChange={(e) =>
                                setPricesPerType((prev) => ({
                                  ...prev,
                                  [t]: Number(e.target.value),
                                }))
                              }
                              className="w-full px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button
            type="button"
            size="md"
            variant="primary"
            onClick={handleAddItem}
            className="w-full sm:w-auto"
          >
            Add Item
          </Button>
          <Button
            type="button"
            size="md"
            variant="success"
            onClick={handleCreatePO}
            disabled={tableItems.length === 0 || isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? "Creating..." : "Create PO"}
          </Button>
        </div>

        {error && <div className="text-red-500 mt-4">{error}</div>}

        <POTable
          items={tableItems}
          getHeaders={() => [
            "Class",
            "Type",
            "Name",
            "Raw Material",
            "Quantity",
            "Price per Unit",
            "Delete",
          ]}
          onDelete={handleDelete}
        />

        <SuccessModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            navigate("/purchase");
          }}
        />
      </div>
    </div>
  );
};

export default CreatePO;
import React from "react";
import Select from "../../../components/forms/Select";

const FilterBar = ({modalConfig, filters, setFilters}) => {
  const modelOptions = Object.keys(modalConfig || {});

  const powerOptions =
    (filters.model && modalConfig[filters.model]?.powers?.map(String)) || [];

  const ratioOptions =
    filters.model && filters.power
       ? [...(modalConfig[filters.model]?.ratios?.[filters.power] || [])]
        .map(parseFloat)
        .filter((r) => !isNaN(r))
        .sort((a, b) => a - b)
        .map(String)
    : [];

  return (
    <div className="flex gap-4 mb-4">
      <Select
        name="model"
        value={filters.model}
        onChange={(e) =>
          setFilters({
            model: e.target.value,
            power: "",
            ratio: "",
            type: filters.type,
          })
        }
      >
        <option value="">All Models</option>
        {modelOptions.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>

      {/* Power Filter */}
      <Select
        name="power"
        value={filters.power}
        onChange={(e) =>
          setFilters({...filters, power: e.target.value, ratio: ""})
        }
        disabled={!filters.model}
      >
        <option value="">All Powers</option>
        {powerOptions.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </Select>

      {/* Ratio Filter */}
      <Select
        name="ratio"
        value={filters.ratio}
        onChange={(e) => setFilters({...filters, ratio: e.target.value})}
        disabled={!filters.power}
      >
        <option value="">All Ratios</option>
        {ratioOptions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </Select>

      {/* Type Filter */}
      <Select
        name="type"
        value={filters.type}
        onChange={(e) => setFilters({...filters, type: e.target.value})}
      >
        <option value="">All Types</option>
       <option value="Base (Foot)">{`Base (Foot)`}</option>
            <option value="Vertical (Flange)">{`Vertical (Flange)`}</option>
      </Select>
    </div>
  );
};

export default FilterBar;

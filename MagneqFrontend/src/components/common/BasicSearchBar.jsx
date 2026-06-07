// components/SearchBar.jsx
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {CiSearch} from "react-icons/ci";
import {useSearch} from "../../context/SearchbarContext";

const BasicSearchBar = ({placeholder, className, onChange, value}) => {
  const [error, setError] = useState("");

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 shadow-sm">
        <CiSearch className="mr-2" />
        <input
          type="text"
          className="w-full outline-none bg-transparent text-sm"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
};

export default BasicSearchBar;

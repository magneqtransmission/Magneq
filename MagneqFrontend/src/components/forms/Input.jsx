import React from "react";
import clsx from "clsx";

const Input = ({ id, name, type = "text", placeholder = "", className = "", ...props }) => (
  <input
    id={id}
    name={name}
    type={type}
    placeholder={placeholder}
    className={clsx(
      "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm",
      "placeholder:text-gray-500 dark:placeholder:text-gray-400",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400",
      "disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
);

export default Input;
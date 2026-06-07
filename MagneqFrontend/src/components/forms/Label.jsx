import React from "react";
import clsx from "clsx";

const Label = ({ htmlFor, children, className = "" }) => (
  <label
    htmlFor={htmlFor}
    className={clsx("block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300", className)}
  >
    {children}
  </label>
);

export default Label;
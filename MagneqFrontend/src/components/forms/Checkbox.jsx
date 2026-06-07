import React from "react";
import clsx from "clsx";

const Checkbox = ({ id, name, className = "", ...props }) => (
  <input
    type="checkbox"
    id={id}
    name={name}
    className={clsx(
      "h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600",
      className
    )}
    {...props}
  />
);

export default Checkbox;
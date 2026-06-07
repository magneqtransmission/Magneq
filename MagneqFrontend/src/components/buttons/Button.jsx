import React from "react";
import clsx from "clsx";

const Button = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  loading = false,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  ...props
}) => {
  const isDisabled = disabled || loading;

  const sizeClasses = {
    sm: "px-1 py-1 text-sm",
    md: "px-1 py-1 text-md",
    lg: "px-2 py-2 text-md",
  };

  const variantClasses = {
    primary:
      "bg-button text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300  dark:hover:bg-brand-500",
    outline:
      "bg-background text-text ring-1 ring-inset ring-gray-300 hover:bg-gray-50   dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg transition focus:outline-none",
        sizeClasses[size],
        variantClasses[variant],
        isDisabled && "cursor-not-allowed opacity-50",
        className
      )}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-4l3 3 3-3h-4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
          />
        </svg>
      ) : (
        <>
          {startIcon && <span className="flex items-center p-0">{startIcon}</span>}
          {children}
          {endIcon && <span className="flex items-center">{endIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;